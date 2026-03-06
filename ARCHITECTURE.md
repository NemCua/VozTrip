# Kiến trúc SmartTour

## Tổng quan

SmartTour được xây dựng theo mô hình **MVVM (Model-View-ViewModel)** kết hợp với **Clean Architecture**, đảm bảo tách biệt các tầng và dễ dàng bảo trì, mở rộng.

## Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MainPage    │  │  AdminPage   │  │  MapPage     │      │
│  │   (View)     │  │   (View)     │  │   (View)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │MainViewModel │  │AdminViewModel│  │ MapViewModel │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────┐
│                       Business Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Geofence    │  │  Narration   │  │  Analytics   │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼───────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼───────────────┐
│                        Data Layer                              │
│  ┌────────────────────────────────────────────────────┐       │
│  │            DatabaseService (SQLite)                 │       │
│  └────────────────────────────────────────────────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   POI    │  │   User   │  │AccessLog │  │   Tour   │     │
│  │  Model   │  │  Model   │  │  Model   │  │  Model   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────────────────────────────────────────────────┘
```

## Các tầng (Layers)

### 1. Presentation Layer (UI)

**Views (XAML):**
- `MainPage.xaml`: Giao diện chính cho du khách
- `AdminPage.xaml`: Giao diện quản trị CMS
- `MapPage.xaml`: Giao diện bản đồ tương tác

**ViewModels:**
- `MainViewModel`: Logic cho trang chính
- `AdminViewModel`: Logic cho trang quản trị
- `MapViewModel`: Logic cho bản đồ

**Responsibilities:**
- Hiển thị dữ liệu cho người dùng
- Xử lý tương tác người dùng
- Data binding với ViewModels

### 2. Business Layer (Services)

**GeofenceService:**
```csharp
Responsibilities:
- Theo dõi vị trí GPS liên tục
- Phát hiện khi người dùng vào/ra khỏi vùng POI
- Trigger events khi có POI được kích hoạt
- Quản lý background location tracking
```

**NarrationService:**
```csharp
Responsibilities:
- Phát file audio thuyết minh
- Text-to-Speech (TTS)
- Quản lý hàng đợi phát
- Ngăn chặn phát trùng lặp
- Hỗ trợ đa ngôn ngữ
```

**AnalyticsService:**
```csharp
Responsibilities:
- Ghi log truy cập
- Phân tích dữ liệu người dùng
- Tạo báo cáo thống kê
- Export dữ liệu
```

### 3. Data Layer

**DatabaseService:**
```csharp
Responsibilities:
- CRUD operations cho tất cả models
- SQLite connection management
- Data seeding
- Query optimization
```

**Models:**
- `PointOfInterest`: Điểm thuyết minh
- `User`: Người dùng
- `AccessLog`: Log truy cập
- `Tour`: Tour du lịch

## Luồng dữ liệu (Data Flow)

### 1. Luồng GPS Tracking

```
User moves
    ↓
GeofenceService.MonitorLocationAsync()
    ↓
Get current location
    ↓
Check nearby POIs (DatabaseService)
    ↓
Calculate distance
    ↓
If within radius → Trigger POITriggered event
    ↓
MainViewModel receives event
    ↓
Call NarrationService.PlayNarrationAsync()
    ↓
Log to AnalyticsService
    ↓
Update UI
```

### 2. Luồng Admin CMS

```
Admin opens AdminPage
    ↓
AdminViewModel.LoadDataAsync()
    ↓
DatabaseService.GetPOIsAsync()
    ↓
Display in CollectionView
    ↓
Admin uploads audio
    ↓
AdminViewModel.UploadAudioAsync()
    ↓
Save file to local storage
    ↓
Update POI.AudioPath
    ↓
DatabaseService.SavePOIAsync()
    ↓
Reload data
```

### 3. Luồng Thuyết minh

```
POI triggered
    ↓
NarrationService.PlayNarrationAsync(POI, language)
    ↓
Check if audio file exists
    ↓
If YES → PlayAudioFileAsync()
If NO → PlayTextToSpeechAsync()
    ↓
Fire NarrationStarted event
    ↓
Play audio/TTS
    ↓
Fire NarrationCompleted event
    ↓
Update AccessLog (audioPlayed = true)
```

## Design Patterns

### 1. MVVM (Model-View-ViewModel)

**Benefits:**
- Tách biệt UI và business logic
- Dễ dàng unit testing
- Code reusability
- Two-way data binding

**Implementation:**
- Views: XAML files
- ViewModels: ObservableObject classes
- Models: Plain C# classes
- Binding: CommunityToolkit.Mvvm

### 2. Dependency Injection

**Container:** Microsoft.Extensions.DependencyInjection

**Registrations:**
```csharp
// Services - Singleton
builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddSingleton<GeofenceService>();
builder.Services.AddSingleton<NarrationService>();
builder.Services.AddSingleton<AnalyticsService>();

// ViewModels - Transient
builder.Services.AddTransient<MainViewModel>();
builder.Services.AddTransient<AdminViewModel>();

// Views - Transient
builder.Services.AddTransient<MainPage>();
builder.Services.AddTransient<AdminPage>();
```

### 3. Repository Pattern

**DatabaseService** hoạt động như Repository:
- Encapsulate data access logic
- Provide clean API for data operations
- Easy to mock for testing

### 4. Observer Pattern

**Event-driven architecture:**
```csharp
// GeofenceService
public event EventHandler<POITriggeredEventArgs> POITriggered;

// NarrationService
public event EventHandler<NarrationEventArgs> NarrationStarted;
public event EventHandler<NarrationEventArgs> NarrationCompleted;

// Subscribers
_geofenceService.POITriggered += OnPOITriggered;
```

## Các thành phần chính

### 1. Background Service (Geofencing)

**Android Implementation:**
```csharp
// Uses FusedLocationProviderClient
// Foreground Service for continuous tracking
// WorkManager for periodic updates
```

**iOS Implementation:**
```csharp
// Uses CLLocationManager
// Background Location Updates
// Region Monitoring
```

**Challenge:**
- Battery optimization
- Accuracy vs power consumption
- OS limitations (iOS background restrictions)

**Solution:**
- Adaptive polling interval
- Geofence regions instead of continuous tracking
- Significant location changes only

### 2. Offline Support

**Strategy:**
- SQLite for local data storage
- Pre-downloaded audio files
- Sync when online
- Conflict resolution

**Sync Flow:**
```
App starts
    ↓
Check network
    ↓
If online:
    - Fetch updates from server
    - Merge with local data
    - Resolve conflicts (last-write-wins)
    - Update local DB
    ↓
If offline:
    - Use local data only
    - Queue changes for sync
```

### 3. Multi-language Support

**Implementation:**
```csharp
// POI has multiple language fields
public string TTSScriptVi { get; set; }
public string TTSScriptEn { get; set; }
public string AudioPathVi { get; set; }
public string AudioPathEn { get; set; }

// User selects language
_narrationService.SetLanguage("vi");

// Service automatically uses correct field
var script = language == "vi" ? poi.TTSScriptVi : poi.TTSScriptEn;
```

## Performance Optimizations

### 1. Database

**Indexing:**
```csharp
[Indexed]
public double Latitude { get; set; }

[Indexed]
public double Longitude { get; set; }

[Indexed]
public bool IsActive { get; set; }
```

**Caching:**
```csharp
// Cache frequently accessed POIs in memory
private List<PointOfInterest>? _cachedPOIs;
```

### 2. GPS

**Adaptive Polling:**
```csharp
// Slower updates when stationary
if (IsUserStationary())
    await Task.Delay(30000); // 30s
else
    await Task.Delay(5000);  // 5s
```

### 3. Audio

**Pre-loading:**
```csharp
// Pre-load audio for nearby POIs
var nearbyPOIs = await GetNearbyPOIsAsync();
foreach (var poi in nearbyPOIs)
{
    PreloadAudio(poi);
}
```

## Security Considerations

### 1. Data Privacy

- User location data is stored locally only
- Anonymous analytics
- GDPR compliant
- No personal data sent to server without consent

### 2. Data Encryption

```csharp
// Encrypt sensitive user data
public string EncryptFingerprintTemplate(string template)
{
    // Use AES encryption
    return encrypted;
}
```

### 3. Authentication

```csharp
// Role-based access control
public enum UserRole
{
    Tourist = 0,
    VIP = 1,
    Staff = 2,
    Admin = 3
}
```

## Testing Strategy

### 1. Unit Tests

```csharp
[Test]
public void CalculateDistance_Returns_CorrectValue()
{
    var distance = CalculateDistance(21.0285, 105.8542, 21.0294, 105.8521);
    Assert.AreEqual(0.23, distance, 0.01);
}
```

### 2. Integration Tests

```csharp
[Test]
public async Task DatabaseService_SavePOI_Works()
{
    var poi = new PointOfInterest { Name = "Test" };
    await _database.SavePOIAsync(poi);
    var saved = await _database.GetPOIAsync(poi.Id);
    Assert.IsNotNull(saved);
}
```

### 3. UI Tests

```csharp
[Test]
public void MainPage_LoadsPOIs()
{
    App.Tap("StartMonitoringButton");
    App.WaitForElement("POIList");
    Assert.IsTrue(App.Query("POIList").Any());
}
```

## Scalability

### Future Enhancements

1. **Cloud Sync:**
   - Azure Mobile Apps / Firebase
   - Real-time updates
   - Multi-device sync

2. **Advanced Analytics:**
   - ML-based recommendations
   - Heatmap visualization
   - Predictive analytics

3. **Social Features:**
   - Share tours
   - Reviews & ratings
   - User-generated content

4. **AR Integration:**
   - ARKit/ARCore
   - 3D models overlay
   - Interactive experiences

## Deployment Architecture

```
┌─────────────┐
│   User      │
│  Devices    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Mobile App     │  ← .NET MAUI (Android/iOS/Windows)
│  (Offline-first)│
└──────┬──────────┘
       │
       ▼ (Optional)
┌─────────────────┐
│  API Gateway    │  ← Azure API Management
└──────┬──────────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│ REST API    │  │  SignalR    │  ← ASP.NET Core
│ (Data sync) │  │ (Real-time) │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────────────────┐
│   Azure SQL Database    │
│   or CosmosDB           │
└─────────────────────────┘
```

## Monitoring & Logging

**Application Insights:**
- Crash reports
- Performance metrics
- User analytics

**Custom Logging:**
```csharp
System.Diagnostics.Debug.WriteLine($"GPS: {lat}, {lng}");
```

## Conclusion

SmartTour được thiết kế với kiến trúc modular, scalable và maintainable. Việc tách biệt rõ ràng giữa các tầng giúp:
- Dễ dàng thêm tính năng mới
- Test được từng thành phần độc lập
- Thay đổi implementation mà không ảnh hưởng các tầng khác
- Hỗ trợ đa nền tảng hiệu quả
