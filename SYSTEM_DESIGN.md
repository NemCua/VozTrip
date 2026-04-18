# VozTrip — Tài liệu Thiết kế Hệ thống (System Design Document)

> Phiên bản: 2026-04-17  
> Backend: ASP.NET Core Minimal API · Database: PostgreSQL (EF Core) · Media: Cloudinary · Translation: LibreTranslate · Auth: JWT HS256

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Mô hình dữ liệu (Entity Model)](#2-mô-hình-dữ-liệu-entity-model)
3. [Phân quyền & Xác thực](#3-phân-quyền--xác-thực)
4. [Feature Flag](#4-feature-flag)
5. [API Catalog — Guest](#5-api-catalog--guest)
6. [API Catalog — Auth](#6-api-catalog--auth)
7. [API Catalog — Seller](#7-api-catalog--seller)
8. [API Catalog — Admin](#8-api-catalog--admin)
9. [Services nội bộ](#9-services-nội-bộ)
10. [Sơ đồ tuần tự (Sequence Diagrams)](#10-sơ-đồ-tuần-tự-sequence-diagrams)
    - [SD-01 Khởi động app & tạo session](#sd-01-khởi-động-app--tạo-session)
    - [SD-02 Browse danh sách POI & GPS Trigger](#sd-02-browse-danh-sách-poi--gps-trigger)
    - [SD-03 Xem chi tiết POI (Audio / TTS)](#sd-03-xem-chi-tiết-poi-audio--tts)
    - [SD-04 Seller đăng ký & Admin duyệt](#sd-04-seller-đăng-ký--admin-duyệt)
    - [SD-05 Seller đăng nhập](#sd-05-seller-đăng-nhập)
    - [SD-06 Seller tạo POI (có kiểm tra plan limit)](#sd-06-seller-tạo-poi-có-kiểm-tra-plan-limit)
    - [SD-07 Upload audio thuyết minh](#sd-07-upload-audio-thuyết-minh)
    - [SD-08 Dịch tự động đa ngôn ngữ](#sd-08-dịch-tự-động-đa-ngôn-ngữ)
    - [SD-09 Upload media (ảnh / video)](#sd-09-upload-media-ảnh--video)
    - [SD-10 Admin xóa media vi phạm](#sd-10-admin-xóa-media-vi-phạm)
    - [SD-11 Admin xóa POI (dọn Cloudinary)](#sd-11-admin-xóa-poi-dọn-cloudinary)
    - [SD-12 Seller nâng cấp VIP](#sd-12-seller-nâng-cấp-vip)
11. [Luồng nghiệp vụ chính (Business Flow)](#11-luồng-nghiệp-vụ-chính-business-flow)
12. [Ràng buộc & Quy tắc nghiệp vụ](#12-ràng-buộc--quy-tắc-nghiệp-vụ)
13. [Danh sách Feature Flag](#13-danh-sách-feature-flag)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                               │
│  React Native App (Expo)          Next.js Website (Admin/Seller)│
└────────────────────┬────────────────────────────┬──────────────┘
                     │ HTTP/REST (JSON)            │ HTTP/REST (JSON)
                     ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND — ASP.NET Core Minimal API            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  GuestRoutes │ │  AuthRoutes  │ │ SellerRoutes │            │
│  │  /api/*      │ │/api/auth/*   │ │ /api/seller/*│            │
│  └──────────────┘ └──────────────┘ └──────┬───────┘            │
│                                           │                    │
│  ┌──────────────┐ ┌────────────────────────────────────────┐   │
│  │  AdminRoutes │ │        Feature Flag Middleware          │   │
│  │ /api/admin/* │ │  WithFeatureFlag(f => f.Features.X.Y)  │   │
│  └──────────────┘ └────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  CloudinaryService│  │LibreTranslateService│                 │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────────────────────────────┐                  │
│  │  AppDbContext (Entity Framework Core)    │                  │
│  └──────────────────────┬───────────────────┘                  │
└───────────────────────────────────────────────────────────────-─┘
                          │
                          ▼
              ┌───────────────────────┐
              │  PostgreSQL Database   │
              └───────────────────────┘

External Services:
  Cloudinary  — lưu trữ ảnh, video (voztrip/images/, voztrip/videos/),
                audio (voztrip/audio/)
  LibreTranslate — dịch tự động title/description đa ngôn ngữ
```

### Các tầng định tuyến

| Module | Route Prefix | Auth Required | Role |
|---|---|---|---|
| `GuestRoutes` | `/api/` (không prefix) | Không | - |
| `AuthRoutes` | `/api/auth/` | Không | - |
| `SellerRoutes` | `/api/seller/` | JWT | `seller` |
| `AdminRoutes` | `/api/admin/` | JWT | `admin` |

---

## 2. Mô hình dữ liệu (Entity Model)



## 3. Phân quyền & Xác thực

### 3.1 Cơ chế JWT

- Thuật toán: **HMAC SHA-256** (`HmacSha256`)
- Thời hạn token: **7 ngày** kể từ thời điểm đăng nhập
- Claims trong token:

| Claim | Giá trị |
|---|---|
| `ClaimTypes.NameIdentifier` | `User.UserId` |
| `ClaimTypes.Name` | `User.Username` |
| `ClaimTypes.Role` | `"admin"` hoặc `"seller"` |

### 3.2 Quy tắc truy cập

| Endpoint Group | Yêu cầu |
|---|---|
| `GET /api/languages`, `/api/pois`, `/api/pois/{id}`, `/api/pois/{id}/questions`, `POST /api/sessions`, `POST /api/visitlogs` | **Không cần** auth |
| `POST /api/auth/login`, `POST /api/auth/register` | **Không cần** auth |
| `/api/seller/*` | JWT + Role = `seller` + `ApprovedAt != null` |
| `/api/admin/*` | JWT + Role = `admin` |

### 3.3 Các điều kiện login bị từ chối

| Tình huống | HTTP Response |
|---|---|
| Sai username hoặc password | `401 Unauthorized` |
| Tài khoản `IsActive = false` | `403 Forbid` |
| Seller chưa được admin duyệt (`ApprovedAt = null`) | `403 JSON { message: "Tài khoản chưa được duyệt" }` |

---

## 4. Feature Flag

Toàn bộ endpoint đều được bảo vệ bởi feature flag. Nếu flag bị tắt, endpoint trả về `404 { message: "Tính năng này hiện không khả dụng." }` thay vì thực thi handler.

Cách hoạt động:
```
Request → EndpointFilter (WithFeatureFlag) → kiểm tra FeaturesConfig
    → flag = false → 404 ngay lập tức
    → flag = true  → chạy handler bình thường
```

`FeaturesConfig` được inject qua DI, đọc từ `appsettings.json` (hoặc environment variables).

---

## 5. API Catalog — Guest

> Prefix: không có  
> Auth: Không cần  
> Feature flag namespace: `Features.Guest.*`

### F03 — Lấy danh sách ngôn ngữ

```
GET /api/languages
```

**Response 200:**
```json
[
  { "languageId": "...", "languageCode": "vi", "languageName": "Tiếng Việt" },
  { "languageId": "...", "languageCode": "en", "languageName": "English" }
]
```

> Chỉ trả về ngôn ngữ có `IsActive = true`.

---

### F04 — Danh sách POI (Browse / Nearby)

```
GET /api/pois?languageId={languageId}
```

**Query Params:**
| Param | Bắt buộc | Mô tả |
|---|---|---|
| `languageId` | Không | GUID ngôn ngữ, dùng để lấy tên địa phương hóa |

**Response 200:**
```json
[
  {
    "poiId": "...",
    "poiName": "Bảo tàng Lịch sử",
    "latitude": 10.7769,
    "longitude": 106.7009,
    "triggerRadius": 10.0,
    "shopName": "Công ty Du lịch ABC",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "localizedName": "Historical Museum"
  }
]
```

> - Chỉ trả về POI có `IsActive = true`.  
> - `thumbnailUrl`: ảnh đầu tiên theo `SortOrder ASC` (nếu flag `Thumbnail.Enabled`).  
> - `localizedName`: tên địa phương hóa theo ngôn ngữ (nếu flag `LocalizedName.Enabled`).

---

### F05 — Chi tiết một POI

```
GET /api/pois/{id}?languageId={languageId}
```

**Path Params:**
| Param | Mô tả |
|---|---|
| `id` | `PoiId` |

**Response 200:**
```json
{
  "poiId": "...",
  "poiName": "Bảo tàng Lịch sử",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "triggerRadius": 10.0,
  "zoneName": "Quận 1",
  "media": [
    { "mediaId": "...", "mediaType": "image", "mediaUrl": "...", "sortOrder": 0 }
  ],
  "localizations": [
    {
      "languageId": "...",
      "languageCode": "vi",
      "title": "Bảo tàng Lịch sử Việt Nam",
      "description": "...",
      "audioUrl": "https://res.cloudinary.com/...",
      "audioDuration": 120
    }
  ]
}
```

> - `media`: theo `SortOrder ASC` (nếu flag `Media.Enabled`).  
> - `localizations`: lọc theo `languageId` nếu có, hoặc trả về tất cả (nếu flag `Localization.Enabled`).  
> - `audioUrl`: chỉ xuất hiện nếu flag `Audio.Enabled`.

---

### F06 — Q&A của POI

```
GET /api/pois/{id}/questions?languageId={languageId}
```

**Response 200:**
```json
[
  {
    "questionId": "...",
    "questionText": "Giờ mở cửa là mấy giờ?",
    "answer": {
      "answerText": "8:00 - 17:00 hàng ngày",
      "audioUrl": null
    }
  }
]
```

> - Chỉ trả về câu hỏi có `IsActive = true`.  
> - Sắp xếp theo `SortOrder ASC`.

---

### F07 — Tạo Guest Session

```
POST /api/sessions
Body: { "sessionId": "uuid-do-app-sinh", "languageId": "..." }
```

**Response 200:**
```json
{ "sessionId": "...", "startedAt": "2026-04-17T10:00:00Z" }
```

> Idempotent: nếu `sessionId` đã tồn tại, không tạo mới, trả về session hiện tại.

---

### F07 — Ghi lượt tham quan (GPS Trigger)

```
POST /api/visitlogs
Body: { "sessionId": "...", "poiId": "..." }
```

**Response 200:**
```json
{ "logId": "..." }
```

---

## 6. API Catalog — Auth

> Prefix: `/api/auth/`  
> Auth: Không cần

### Đăng nhập

```
POST /api/auth/login
Body: { "username": "...", "password": "..." }
```

**Response 200:**
```json
{
  "token": "eyJ...",
  "userId": "...",
  "username": "seller01",
  "role": "seller",
  "fullName": "Nguyễn Văn A",
  "shopName": "Du lịch ABC"
}
```

**Các response lỗi:**
| Code | Điều kiện |
|---|---|
| `401` | Sai username/password |
| `403 Forbid` | `IsActive = false` |
| `403 JSON` | Seller chưa được duyệt |

---

### Đăng ký Seller

```
POST /api/auth/register
Body:
{
  "username": "seller01",
  "password": "password123",
  "shopName": "Du lịch ABC",
  "fullName": "Nguyễn Văn A",
  "email": "a@example.com",
  "contactPhone": "0901234567",
  "description": "Mô tả đơn vị"
}
```

**Response 200:**
```json
{ "message": "Đăng ký thành công, chờ admin duyệt" }
```

> Tạo đồng thời `User` (role=seller) và `Seller`. `ApprovedAt = null` cho đến khi Admin duyệt.

---

## 7. API Catalog — Seller

> Prefix: `/api/seller/`  
> Auth: JWT, Role = `seller`  
> Feature flag namespace: `Features.Seller.*`

### F08 — Profile

```
GET /api/seller/profile
```

**Response 200:**
```json
{
  "shopName": "Du lịch ABC",
  "plan": "free",
  "planUpgradedAt": null,
  "poiCount": 1,
  "poiLimit": 1
}
```

> `poiLimit = null` nếu là VIP (không giới hạn).

---

### F09 — Nâng cấp VIP

```
POST /api/seller/upgrade
Body: { "cardNumber": "1234 5678 9012 3456", "cardHolder": "NGUYEN VAN A" }
```

**Response 200:**
```json
{ "message": "Nâng cấp VIP thành công!", "plan": "vip" }
```

> Nếu flag `MockPayment.Enabled`: kiểm tra `CardNumber` có 16 chữ số (sau khi bỏ dấu cách).

---

### F10 — Seller Dashboard / Thống kê

```
GET /api/seller/stats
```

**Response 200:**
```json
{
  "totalPois": 3,
  "activePois": 2,
  "totalVisits": 150,
  "visitsToday": 12,
  "topPois": [
    { "poiId": "...", "poiName": "Bảo tàng", "count": 80 }
  ],
  "visitsByDay": [
    { "date": "2026-04-11", "count": 18 }
  ]
}
```

> Các trường `totalVisits`, `visitsToday`, `topPois`, `visitsByDay` chỉ xuất hiện nếu flag tương ứng bật.

---

### F11 — Quản lý POI

#### Danh sách POI của Seller

```
GET /api/seller/pois
```

**Response 200:** Mảng POI thuộc seller đang đăng nhập, sắp xếp `CreatedAt DESC`.

---

#### Tạo POI mới

```
POST /api/seller/pois
Body:
{
  "poiName": "Nhà thờ Đức Bà",
  "latitude": 10.7797,
  "longitude": 106.6990,
  "zoneId": "...",
  "triggerRadius": 15.0,
  "isActive": true
}
```

**Response 200:** `{ "poiId": "..." }`

**Logic kiểm tra plan limit:**
- Nếu flag `PlanLimit.Enabled` VÀ seller đang ở plan `"free"`:
  - Đếm POI hiện tại của seller
  - Nếu >= `FreePlanMaxPois` → `400 { message: "Gói Free chỉ được tạo N POI...", code: "PLAN_LIMIT" }`

---

#### Cập nhật POI

```
PUT /api/seller/pois/{id}
Body: (giống Create, thêm isActive)
```

> Chỉ cho phép cập nhật POI thuộc seller đang đăng nhập.

---

#### Xóa POI

```
DELETE /api/seller/pois/{id}
```

> Xóa POI, cascade xóa các Localization, Media, Question, VisitLog liên quan (theo DB cascade).  
> **Không tự dọn Cloudinary** — đây là nhiệm vụ của Admin (`/api/admin/pois/{id}`).

---

### F12 — Nội dung đa ngôn ngữ (Localization)

#### Lấy tất cả localization của POI

```
GET /api/seller/pois/{id}/localizations
```

---

#### Upsert localization (tạo hoặc cập nhật)

```
PUT /api/seller/pois/{id}/localizations/{languageId}
Body:
{
  "title": "Notre-Dame Cathedral",
  "description": "Built in 1880...",
  "audioUrl": null,
  "audioPublicId": null,
  "audioDuration": null
}
```

> Nếu chưa có record cho cặp (PoiId, LanguageId): tạo mới. Nếu đã có: cập nhật.  
> Luôn set `IsAutoTranslated = false` (đây là nhập thủ công).

---

#### Xóa một localization

```
DELETE /api/seller/pois/{id}/localizations/{languageId}
```

> Xóa audio trên Cloudinary (nếu có `AudioPublicId`), sau đó xóa record.

---

### F13 — Upload Audio thuyết minh

```
POST /api/seller/pois/{id}/localizations/{languageId}/audio
Content-Type: multipart/form-data
Field: file (audio/*)
```

**Response 200:** `{ "audioUrl": "https://res.cloudinary.com/..." }`

**Logic:**
1. Kiểm tra `file.ContentType` phải bắt đầu bằng `audio/`
2. Nếu đã có `AudioPublicId` cũ VÀ flag `DeleteOldOnReplace.Enabled`: xóa file cũ trên Cloudinary
3. Upload file mới lên Cloudinary folder `voztrip/audio/{sellerId}`
4. Upsert `PoiLocalization.AudioUrl` và `AudioPublicId`

> **Quy tắc:** Mỗi localization chỉ giữ **một** file audio tại một thời điểm.

---

### F14 — Dịch tự động (Auto Translate)

```
POST /api/seller/pois/{id}/localizations/translate
Body: { "sourceLanguageId": "..." }
```

**Response 200:** `{ "message": "Đã dịch sang N ngôn ngữ", "translated": N }`

**Logic:**
1. Tìm localization nguồn theo `sourceLanguageId`
2. Lấy toàn bộ ngôn ngữ active (trừ ngôn ngữ nguồn)
3. Nếu flag `SkipExistingManual.Enabled`: bỏ qua các ngôn ngữ đã có localization thủ công (`IsAutoTranslated = false`)
4. Gọi `LibreTranslateService.TranslateToManyAsync()` song song cho tất cả ngôn ngữ đích
5. Upsert localization cho từng ngôn ngữ, set `IsAutoTranslated = true`

---

### F15 — Quản lý Media (Ảnh / Video)

#### Danh sách media

```
GET /api/seller/pois/{id}/media
```

---

#### Thêm media bằng URL (không upload)

```
POST /api/seller/pois/{id}/media
Body:
{
  "mediaType": "image",
  "mediaUrl": "https://...",
  "publicId": "...",
  "sortOrder": 0
}
```

---

#### Upload media lên Cloudinary

```
POST /api/seller/pois/{id}/media/upload
Content-Type: multipart/form-data
Field: file (image/* hoặc video/*)
```

**Logic:**
- `video/*` → `UploadVideoAsync` → folder `voztrip/videos/{sellerId}` (cần flag `Video.Enabled`)
- `image/*` → `UploadImageAsync` → folder `voztrip/images/{sellerId}` (cần flag `Image.Enabled`)
- `SortOrder` = số lượng media hiện tại của POI (append vào cuối)

**Response 200:** `{ "mediaId": "...", "mediaUrl": "...", "mediaType": "..." }`

---

#### Xóa media

```
DELETE /api/seller/media/{mediaId}
```

> Xóa file trên Cloudinary theo `PublicId` và `MediaType`, sau đó xóa record.

---

### F16 — Quản lý Q&A

#### Lấy danh sách câu hỏi

```
GET /api/seller/pois/{id}/questions
```

---

#### Tạo câu hỏi mới

```
POST /api/seller/pois/{id}/questions
Body:
{
  "languageId": "...",
  "questionText": "Giờ mở cửa là mấy giờ?",
  "sortOrder": 0
}
```

---

#### Upsert câu trả lời

```
PUT /api/seller/questions/{questionId}/answer
Body:
{
  "answerText": "8:00 - 17:00 hàng ngày",
  "audioUrl": null,
  "audioPublicId": null
}
```

> Nếu chưa có Answer: tạo mới. Nếu đã có: cập nhật.

---

#### Xóa câu hỏi

```
DELETE /api/seller/questions/{questionId}
```

> Cascade xóa Answer liên quan.

---

## 8. API Catalog — Admin

> Prefix: `/api/admin/`  
> Auth: JWT, Role = `admin`  
> Feature flag namespace: `Features.Admin.*`

### F17 — Dashboard tổng quan

```
GET /api/admin/stats
```

**Response 200:**
```json
{
  "totalSellers": 25,
  "pendingSellers": 3,
  "totalPois": 120,
  "activePois": 98,
  "totalVisits": 5000,
  "visitsToday": 47,
  "totalSessions": 1200,
  "topPois": [
    { "poiId": "...", "poiName": "Bảo tàng", "count": 450 }
  ],
  "visitsByDay": [
    { "date": "2026-04-11", "count": 320 }
  ]
}
```

> `topPois`: Top 5 POI có nhiều lượt GPS trigger nhất (nếu flag `Top5Pois.Enabled`).  
> `visitsByDay`: 7 ngày gần nhất (nếu flag `VisitChart7Days.Enabled`).

---

### F18 — Quản lý Seller

#### Danh sách Seller

```
GET /api/admin/sellers
```

> Sắp xếp: Seller chưa duyệt lên đầu, sau đó theo `CreatedAt DESC`.

---

#### Tạo Seller thủ công

```
POST /api/admin/sellers
Body:
{
  "username": "seller02",
  "password": "password123",
  "shopName": "Du lịch XYZ",
  "fullName": "...",
  "email": "...",
  "contactPhone": "...",
  "description": "..."
}
```

> Tạo Seller với `ApprovedAt = DateTime.UtcNow` (được duyệt ngay). `ApprovedBy` = AdminId đang đăng nhập.

---

#### Duyệt Seller

```
PUT /api/admin/sellers/{id}/approve
```

**Response 200:** `{ "message": "Duyệt thành công" }`

> Set `ApprovedAt = UtcNow`, `ApprovedBy = AdminId`. Nếu đã duyệt rồi → `400`.

---

### F19 — Quản lý User

#### Danh sách User

```
GET /api/admin/users
```

---

#### Khóa / Mở khóa tài khoản

```
PUT /api/admin/users/{id}/toggle
```

**Response 200:** `{ "isActive": false }`

> Toggle `IsActive`. Không áp dụng cho role `admin`.

---

#### Xóa tài khoản

```
DELETE /api/admin/users/{id}
```

> Không áp dụng cho role `admin`.

---

### F20 — Kiểm duyệt Media

#### Xem tất cả media

```
GET /api/admin/media
```

> Trả về media kèm thông tin POI và chủ sở hữu (Seller).

---

#### Xóa media vi phạm

```
DELETE /api/admin/media/{mediaId}
```

> Nếu flag `CleanCloudinary.Enabled`: xóa file trên Cloudinary theo `PublicId` và `MediaType`.  
> Sau đó xóa record.

---

### F21 — Quản lý POI (Admin)

#### Danh sách tất cả POI

```
GET /api/admin/pois
```

> Trả về tất cả POI của mọi Seller, kèm thông tin Zone, ShopName, số localization, số lượt visit.

---

#### Chi tiết một POI (Admin view)

```
GET /api/admin/pois/{id}
```

> Trả về đầy đủ: thông tin POI, chủ sở hữu (Seller+User), media, localizations, questions+answers.

---

#### Bật / Tắt POI

```
PUT /api/admin/pois/{id}/toggle
```

> Toggle `IsActive`.

---

#### Xóa POI (Admin)

```
DELETE /api/admin/pois/{id}
```

> Nếu flag `CleanCloudinary.Enabled`:
> 1. Xóa tất cả `PoiMedia` trên Cloudinary (theo `PublicId` + `MediaType`)
> 2. Xóa tất cả `AudioPublicId` trong `PoiLocalization` trên Cloudinary (ResourceType = Raw)
>
> Sau đó xóa POI (cascade DB).

---

### F22 — Quản lý Zone

```
GET  /api/admin/zones
POST /api/admin/zones         Body: { "zoneName": "...", "description": "..." }
PUT  /api/admin/zones/{id}    Body: { "zoneName": "...", "description": "..." }
DELETE /api/admin/zones/{id}
```

---

### F23 — Quản lý Ngôn ngữ

```
GET  /api/admin/languages
POST /api/admin/languages         Body: { "languageCode": "ja", "languageName": "日本語" }
PUT  /api/admin/languages/{id}    Body: { "languageCode": "...", "languageName": "...", "isActive": true }
```

---

## 9. Services nội bộ

### CloudinaryService

| Method | Mô tả | Cloudinary Folder | ResourceType |
|---|---|---|---|
| `UploadAudioAsync(file, sellerId)` | Upload file audio | `voztrip/audio/{sellerId}` | `Raw` |
| `UploadImageAsync(file, sellerId)` | Upload ảnh, auto-optimize quality+format | `voztrip/images/{sellerId}` | `Image` |
| `UploadVideoAsync(file, sellerId)` | Upload video | `voztrip/videos/{sellerId}` | `Video` |
| `DeleteAsync(publicId, resourceType)` | Xóa file theo publicId | - | Tuỳ theo loại |

> Tất cả upload đều dùng `UniqueFilename = true`, `Overwrite = false` → không bao giờ đè file cũ.  
> `UploadResult` trả về: `(Url, PublicId, Duration)`.

### LibreTranslateService

| Method | Mô tả |
|---|---|
| `TranslateAsync(text, sourceLang, targetLang)` | Dịch một đoạn text |
| `TranslateToManyAsync(title, description, sourceLang, targetLangs)` | Dịch song song title+description sang nhiều ngôn ngữ |

> Base URL và API key cấu hình qua `appsettings.json`:
> ```json
> "LibreTranslate": { "Url": "https://libretranslate.com", "ApiKey": "..." }
> ```
> Nếu call HTTP thất bại → trả về `null` (không throw exception).

---

## 10. Sơ đồ tuần tự (Sequence Diagrams)

> Ký hiệu: `App` = React Native / Next.js client, `API` = ASP.NET Core Backend, `DB` = PostgreSQL, `CDN` = Cloudinary, `LT` = LibreTranslate

---

luoc do tuan tu
---

## 11. Luồng nghiệp vụ chính (Business Flow)

### Flow: Seller onboarding (đăng ký → duyệt → tạo nội dung)

```
[Seller] Đăng ký     →  Trạng thái: ApprovedAt = null
[Admin]  Duyệt       →  Trạng thái: ApprovedAt = now, ApprovedBy = adminId
[Seller] Đăng nhập   →  Nhận JWT token (7 ngày)
[Seller] Tạo POI     →  Kiểm tra plan limit (Free: max N POI)
[Seller] Nhập text   →  PoiLocalization (title + description)
[Seller] Dịch tự động→  LibreTranslate → PoiLocalization cho các ngôn ngữ khác
[Seller] Upload audio →  Cloudinary → cập nhật AudioUrl, AudioPublicId
[Seller] Upload media →  Cloudinary → PoiMedia record
[Seller] Tạo Q&A     →  Question + Answer
```

### Flow: Guest trải nghiệm

```
[App] Mở lần đầu     →  GET /api/languages → chọn ngôn ngữ
[App] Đồng ý policy  →  POST /api/sessions → tạo GuestSession
[App] Browse POI     →  GET /api/pois?languageId=...
[App] Xem chi tiết   →  GET /api/pois/{id}?languageId=...
[App] Nghe audio     →  Phát trực tiếp từ Cloudinary URL
[App] Nếu no audio   →  TTS đọc description (client-side)
[App] Xem Q&A        →  GET /api/pois/{id}/questions?languageId=...
[App] GPS Trigger    →  khoảng cách < TriggerRadius → POST /api/visitlogs
```

---

## 12. Ràng buộc & Quy tắc nghiệp vụ

| # | Quy tắc | Nơi thực thi |
|---|---|---|
| R01 | Username phải unique | `AuthRoutes.register`: `AnyAsync(Username)` |
| R02 | Seller phải được Admin duyệt mới đăng nhập được | `AuthRoutes.login`: `ApprovedAt != null` |
| R03 | Không thể khóa / xóa tài khoản admin | `AdminRoutes.toggle`, `.delete` |
| R04 | Seller chỉ thao tác với POI của chính mình | `SellerRoutes`: filter `SellerId = sellerId từ JWT` |
| R05 | Plan Free bị giới hạn số POI | `SellerRoutes.createPoi`: `COUNT >= FreePlanMaxPois` |
| R06 | Mỗi POI localization chỉ giữ 1 file audio | `SellerRoutes.uploadAudio`: xóa `AudioPublicId` cũ trước khi upload |
| R07 | Auto-translate đặt `IsAutoTranslated = true`; nhập thủ công đặt `false` | `SellerRoutes.upsertLocalization` và `.translate` |
| R08 | Seller VIP không bị giới hạn số POI | `poiLimit = null` trong profile nếu plan = "vip" |
| R09 | GPS trigger ghi log bất kể đã ghé thăm trước đó chưa | `GuestRoutes.visitlogs`: luôn INSERT mới |
| R10 | Xóa POI từ Admin dọn cả Cloudinary (media + audio) | `AdminRoutes.deletePoi` với `CleanCloudinary flag` |
| R11 | Seller xóa POI không dọn Cloudinary | `SellerRoutes.deletePoi`: chỉ xóa DB |
| R12 | Token JWT có hiệu lực 7 ngày | `AuthRoutes.GenerateToken`: `AddDays(7)` |

---

## 13. Danh sách Feature Flag

### Guest

| Flag | Endpoint bảo vệ |
|---|---|
| `Guest.LanguagePicker.Enabled` | `GET /api/languages` |
| `Guest.ExplorePois.Enabled` | `GET /api/pois` |
| `Guest.ExplorePois.Thumbnail.Enabled` | Tính `thumbnailUrl` trong danh sách POI |
| `Guest.ExplorePois.LocalizedName.Enabled` | Tính `localizedName` trong danh sách POI |
| `Guest.PoiDetail.Enabled` | `GET /api/pois/{id}` |
| `Guest.PoiDetail.Media.Enabled` | Include media trong chi tiết POI |
| `Guest.PoiDetail.Localization.Enabled` | Include localization trong chi tiết POI |
| `Guest.PoiDetail.Audio.Enabled` | Include `audioUrl`, `audioDuration` trong localization |
| `Guest.Qna.Enabled` | `GET /api/pois/{id}/questions` |
| `Guest.GpsVisitLog.Session.Enabled` | `POST /api/sessions` |
| `Guest.GpsVisitLog.VisitLog.Enabled` | `POST /api/visitlogs` |

### Seller

| Flag | Endpoint / Logic bảo vệ |
|---|---|
| `Seller.Profile.Enabled` | `GET /api/seller/profile` |
| `Seller.VipUpgrade.Enabled` | `POST /api/seller/upgrade` |
| `Seller.VipUpgrade.MockPayment.Enabled` | Kiểm tra cardNumber 16 chữ số |
| `Seller.Dashboard.Enabled` | `GET /api/seller/stats` |
| `Seller.Dashboard.TotalVisits.Enabled` | Tính `totalVisits`, `visitsToday` |
| `Seller.Dashboard.Top5Pois.Enabled` | Tính `topPois` |
| `Seller.Dashboard.VisitChart7Days.Enabled` | Tính `visitsByDay` |
| `Seller.PoiManagement.Enabled` | CRUD `/api/seller/pois` |
| `Seller.PoiManagement.Create.Enabled` | Sub-flag tạo POI |
| `Seller.PoiManagement.Update.Enabled` | Sub-flag cập nhật POI |
| `Seller.PoiManagement.Delete.Enabled` | Sub-flag xóa POI |
| `Seller.PoiManagement.PlanLimit.Enabled` | Kiểm tra giới hạn POI theo plan |
| `Seller.PoiManagement.PlanLimit.FreePlanMaxPois` | Số POI tối đa cho Free plan |
| `Seller.Localization.Enabled` | CRUD `/api/seller/pois/{id}/localizations` |
| `Seller.Localization.Upsert.Enabled` | Sub-flag upsert localization |
| `Seller.Localization.Delete.Enabled` | Sub-flag xóa localization |
| `Seller.AudioUpload.Enabled` | `POST .../audio` |
| `Seller.AudioUpload.DeleteOldOnReplace.Enabled` | Xóa audio Cloudinary cũ khi upload mới |
| `Seller.AutoTranslate.Enabled` | `POST .../translate` |
| `Seller.AutoTranslate.SkipExistingManual.Enabled` | Bỏ qua ngôn ngữ đã có bản thủ công |
| `Seller.MediaManagement.Enabled` | CRUD `/api/seller/pois/{id}/media` |
| `Seller.MediaManagement.Upload.Enabled` | Upload media |
| `Seller.MediaManagement.Upload.Image.Enabled` | Cho phép upload ảnh |
| `Seller.MediaManagement.Upload.Video.Enabled` | Cho phép upload video |
| `Seller.MediaManagement.Delete.Enabled` | Xóa media |
| `Seller.QnaManagement.Enabled` | CRUD Q&A |
| `Seller.QnaManagement.CreateQuestion.Enabled` | Tạo câu hỏi |
| `Seller.QnaManagement.UpsertAnswer.Enabled` | Upsert câu trả lời |
| `Seller.QnaManagement.DeleteQuestion.Enabled` | Xóa câu hỏi |

### Admin

| Flag | Endpoint / Logic bảo vệ |
|---|---|
| `Admin.Dashboard.Enabled` | `GET /api/admin/stats` |
| `Admin.Dashboard.Top5Pois.Enabled` | Tính `topPois` |
| `Admin.Dashboard.VisitChart7Days.Enabled` | Tính `visitsByDay` |
| `Admin.SellerManagement.List.Enabled` | `GET /api/admin/sellers` |
| `Admin.SellerManagement.Create.Enabled` | `POST /api/admin/sellers` |
| `Admin.SellerManagement.Approve.Enabled` | `PUT /api/admin/sellers/{id}/approve` |
| `Admin.UserManagement.List.Enabled` | `GET /api/admin/users` |
| `Admin.UserManagement.ToggleLock.Enabled` | `PUT /api/admin/users/{id}/toggle` |
| `Admin.UserManagement.Delete.Enabled` | `DELETE /api/admin/users/{id}` |
| `Admin.ZoneManagement.Enabled` | `GET /api/admin/zones` |
| `Admin.ZoneManagement.Create.Enabled` | `POST /api/admin/zones` |
| `Admin.ZoneManagement.Update.Enabled` | `PUT /api/admin/zones/{id}` |
| `Admin.ZoneManagement.Delete.Enabled` | `DELETE /api/admin/zones/{id}` |
| `Admin.LanguageManagement.Enabled` | `GET /api/admin/languages` |
| `Admin.LanguageManagement.Create.Enabled` | `POST /api/admin/languages` |
| `Admin.LanguageManagement.Update.Enabled` | `PUT /api/admin/languages/{id}` |
| `Admin.MediaModeration.ViewAll.Enabled` | `GET /api/admin/media` |
| `Admin.MediaModeration.DeleteViolation.Enabled` | `DELETE /api/admin/media/{mediaId}` |
| `Admin.MediaModeration.DeleteViolation.CleanCloudinary.Enabled` | Xóa file trên Cloudinary khi xóa media |
| `Admin.PoiModeration.List.Enabled` | `GET /api/admin/pois` |
| `Admin.PoiModeration.Detail.Enabled` | `GET /api/admin/pois/{id}` |
| `Admin.PoiModeration.ToggleActive.Enabled` | `PUT /api/admin/pois/{id}/toggle` |
| `Admin.PoiModeration.Delete.Enabled` | `DELETE /api/admin/pois/{id}` |
| `Admin.PoiModeration.Delete.CleanCloudinary.Enabled` | Dọn Cloudinary khi xóa POI |
