# VozTrip — Feature Flags Architecture

## Tổng quan

File `features.json` là **single source of truth** cho toàn bộ feature flags của dự án VozTrip.
Cả 3 nền tảng (Backend, Website, App) đều đọc từ cùng một nguồn thay vì quản lý riêng lẻ.

---

## Cấu trúc file `features.json`

```
{
  "app"       → thông tin app + maintenance mode
  "auth"      → cấu hình login/register/JWT
  "features"  → feature flags theo nhóm (guest / seller / admin)
  "pages"     → các trang ngoài luồng nghiệp vụ (privacy, emergency)
}
```

Trong `features`, mỗi node có dạng:
```json
{
  "enabled": true,          ← bật/tắt cả feature
  "subFeature": {
    "enabled": true         ← bật/tắt hành vi con
  },
  "someLimit": 1,           ← giá trị cấu hình (không chỉ boolean)
  "note": "F11 — ..."       ← tham chiếu đến PRD (chỉ để đọc, không dùng runtime)
}
```

---

## Luồng dữ liệu (Hướng 2 — Backend as Source of Truth)

```
config/features.json
        │
        ▼
  Backend (.NET)
  ├── Đọc khi startup → inject vào DI (singleton)
  └── Expose: GET /api/features  (public, no auth)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
   Website (Next.js)      App (Expo)
   Server-side fetch       Fetch lúc splash
   cache ~60s              Lưu vào React Context
```

**Lợi ích chính:** Thay đổi `features.json` → restart backend → App/Website tự cập nhật,
**không cần build lại** hay release mới lên store.

---

## Nơi kiểm tra flag — 3 tầng

### Tầng 1 — Global Middleware (Backend)

**Áp dụng cho:** `app.maintenance`

Chặn **toàn bộ request** trước khi routing, trả về 503.
Chỉ bypass cho endpoint `GET /api/features` để client vẫn đọc được trạng thái.

```
Request → [MaintenanceMiddleware] → Router → Handler
                  ↓ nếu enabled
              503 { message: "..." }
```

Khi nào dùng: hệ thống bảo trì, deploy khẩn cấp, sự cố nghiêm trọng.

---

### Tầng 2 — Endpoint Filter (Router level)

**Áp dụng cho:** `features.*.enabled` — bật/tắt cả một nhóm tính năng

Gắn filter vào từng endpoint hoặc group route. Nếu flag tắt → trả về 404 trước khi handler chạy,
**không lộ sự tồn tại của endpoint**.

```
Router → [FeatureFlagFilter("seller.autoTranslate")] → Handler
                  ↓ nếu disabled
              404 { message: "Feature không khả dụng" }
```

Ví dụ áp dụng:
| Endpoint | Flag kiểm tra |
|---|---|
| `POST /api/seller/upgrade` | `features.seller.vipUpgrade.enabled` |
| `POST /api/seller/pois/{id}/localizations/translate` | `features.seller.autoTranslate.enabled` |
| `GET /api/admin/media` | `features.admin.mediaModeration.enabled` |
| `GET/POST/PUT/DELETE /api/admin/zones` | `features.admin.zoneManagement.enabled` |
| `GET/POST/PUT /api/admin/languages` | `features.admin.languageManagement.enabled` |

---

### Tầng 3 — Bên trong Handler

**Áp dụng cho:** sub-flag điều chỉnh **hành vi** chứ không tắt cả endpoint

Không ẩn route, chỉ thay đổi logic bên trong handler.

```
Handler chạy → kiểm tra sub-flag → rẽ nhánh logic
```

Ví dụ áp dụng:
| Handler | Flag kiểm tra | Hành vi |
|---|---|---|
| `POST /api/seller/pois` | `planLimit.enabled` + `freePlanMaxPois` | Giới hạn số POI theo plan |
| `POST /api/seller/upgrade` | `mockPayment.enabled` | Bỏ qua xác thực thật nếu mock |
| `POST .../audio` | `deleteOldOnReplace.enabled` | Có xóa audio cũ trên Cloudinary không |

---

## Implement Backend (.NET)

### Bước 1 — Model C# ánh xạ `features.json`

File: `Config/FeaturesConfig.cs`

Dùng POCO class ánh xạ từng node trong JSON. Không cần ánh xạ field `note`.

### Bước 2 — Đăng ký Singleton vào DI

```csharp
// Program.cs
var featuresJson = File.ReadAllText("../config/features.json");
var features = JsonSerializer.Deserialize<FeaturesConfig>(featuresJson)!;
builder.Services.AddSingleton(features);
```

### Bước 3 — Expose endpoint public

```csharp
app.MapGet("/api/features", (FeaturesConfig features) => Results.Ok(features));
```

### Bước 4 — Global Maintenance Middleware

```csharp
app.Use(async (ctx, next) =>
{
    if (features.App.Maintenance.Enabled && ctx.Request.Path != "/api/features")
    {
        ctx.Response.StatusCode = 503;
        await ctx.Response.WriteAsJsonAsync(new { message = features.App.Maintenance.Message });
        return;
    }
    await next();
});
```

### Bước 5 — Endpoint Filter helper

```csharp
// Dùng khi gắn vào route
group.MapPost("/upgrade", ...)
     .AddEndpointFilter<FeatureFlagFilter<SellerVipUpgradeConfig>>();
```

Hoặc extension method đơn giản hơn:
```csharp
group.MapPost("/upgrade", UpgradeHandler)
     .WithFeatureFlag(features => features.Seller.VipUpgrade.Enabled);
```

---

## Implement Website (Next.js)

### Fetch server-side trong layout hoặc middleware

```ts
// lib/features.ts
export async function getFeatures(): Promise<FeaturesConfig> {
  const res = await fetch(`${process.env.API_URL}/api/features`, {
    next: { revalidate: 60 } // cache 60s
  });
  return res.json();
}
```

### Dùng trong page/component

```tsx
// app/admin/layout.tsx
const features = await getFeatures();
if (!features.features.admin.mediaModeration.enabled) redirect('/admin');
```

---

## Implement App (Expo / React Native)

### Fetch lúc khởi động, lưu vào Context

```ts
// context/FeaturesContext.tsx
const FeaturesProvider = ({ children }) => {
  const [features, setFeatures] = useState<FeaturesConfig>(defaultFeatures);

  useEffect(() => {
    fetch(`${API_BASE}/api/features`)
      .then(r => r.json())
      .then(setFeatures)
      .catch(() => {}); // fallback: dùng defaultFeatures bundle sẵn
  }, []);

  return <FeaturesContext.Provider value={features}>{children}</FeaturesContext.Provider>;
};
```

`defaultFeatures` là `features.json` được `require`/`import` vào bundle lúc build — đóng vai trò **offline fallback**.

### Hook sử dụng ở component

```ts
const useFeature = (path: string): boolean => {
  const features = useContext(FeaturesContext);
  return path.split('.').reduce((obj, key) => obj?.[key], features) ?? false;
};

// Dùng:
const canUpgrade = useFeature('features.seller.vipUpgrade.enabled');
```

---

## Quy tắc khi thêm feature mới

1. Thêm node vào `features.json` với `"enabled": true`
2. Nếu là feature bật/tắt cả nhóm → gắn Endpoint Filter vào route tương ứng
3. Nếu là sub-behavior → kiểm tra trong handler
4. Cập nhật model C# `FeaturesConfig.cs`
5. Cập nhật type TypeScript (shared hoặc mỗi project)

---

## Quy tắc đặt tên flag

- Dùng **camelCase** cho key JSON
- Cấu trúc: `features.[role].[featureName].[subFeature]`
- Ví dụ: `features.seller.autoTranslate.enabled`, `features.admin.zoneManagement.delete.enabled`
- Field `note` chỉ để tham khảo PRD, **không đọc runtime**
