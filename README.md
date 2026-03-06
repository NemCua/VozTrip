# SmartTour - Hệ Thống Thuyết Minh Du Lịch Thông Minh

## 📋 Mô tả dự án

SmartTour là ứng dụng di động đa nền tảng (Android/iOS/Windows) được xây dựng bằng .NET MAUI, cung cấp giải pháp thuyết minh tự động cho các điểm du lịch dựa trên GPS và công nghệ Geofencing.

### Tính năng chính

1. **📍 Map View - Bản đồ tương tác**
   - Hiển thị vị trí người dùng trên bản đồ
   - Hiển thị tất cả các POI (Points of Interest)
   - Highlight các POI gần nhất
   - Xem chi tiết từng POI

2. **🗺️ Hệ thống quản trị nội dung (CMS)**
   - Tạo/Sửa/Xóa điểm thuyết minh (POI)
   - Upload ảnh minh họa
   - Upload file audio thuyết minh
   - Quản lý tour du lịch

3. **🎧 QR Code kích hoạt nội dung**
   - Scan QR code tại điểm để nghe thuyết minh
   - Không cần GPS, hoạt động offline

4. **🌐 Framework .NET MAUI (Android/iOS)**
   - **GPS & Background Service**: Theo dõi vị trí liên tục
   - **Geofencing**: Tự động phát nội dung khi vào vùng POI
   - **TTS/Audio**: Text-to-Speech hoặc phát file audio có sẵn
   - **Map**: Hiển thị bản đồ với MAUI Maps
   - **Offline**: Lưu trữ dữ liệu local bằng SQLite

5. **🎯 Luồng hoạt động mẫu**
   - App tải danh sách POI (lat/lng, bán kính, ưu tiên, nội dung thuyết minh)
   - Khi người dùng di chuyển, background service cập nhật vị trí
   - Geofence Engine xác định POI gần nhất/ưu tiên cao nhất trong bán kính
   - Narration Engine quyết định phát TTS/Audio
   - Ghi log đã phát, tránh lặp lại

6. **📊 Phân tích dữ liệu (Analytics)**
   - Lưu tuyến di chuyển (ẩn danh)
   - Top địa điểm được nghe nhiều nhất
   - Thời gian trung bình nghe 1 POI
   - Heatmap vị trí người dùng

7. **🎨 Thuyết minh tự động**
   - **TTS (Text-to-Speech)**: 
     - Linh hoạt, đa ngôn ngữ
     - Dung lượng nhẹ
   - **File Audio thu sẵn**:
     - Giọng tự nhiên, chuyên nghiệp
     - Chất lượng cao nhưng nặng dữ liệu

8. **👤 Quản lý dữ liệu POI**
   - Danh sách điểm thuyết minh
   - Mô tả văn bản
   - Ảnh minh họa
   - Link bản đồ
   - File audio hoặc script TTS

9. **🔐 Geofence / Kích hoạt điểm thuyết minh**
   - Thiết lập điểm POI với:
     - Tọa độ (lat/lng)
     - Bán kính kích hoạt
     - Mức ưu tiên
   - Tự động phát nội dung khi người dùng:
     - Đi vào vùng
     - Đến gần điểm

10. **🏗️ Kiến trúc gợi ý**
    - **Location + Geofencing**: GPS tracking và geofence
    - **Geofence Engine**: Quyết định khi nào phát thuyết minh
    - **Narration Engine**: Chọn TTS hoặc phát file audio có sẵn, quản lý hàng đợi, chống lặp
    - **Content Layer**: Dữ liệu POI offline (SQLite) + đồng bộ từ server
    - **UI/UX**: Bản đồ (Map), danh sách POI, cài đặt độ nhạy GPS/bán kính, chọn giọng TTS, tải gói offline

11. **🎯 GPS Tracking theo thời gian thực**
    - Lấy vị trí người dùng liên tục (foreground + background)
    - Tối ưu pin, độ chính xác

12. **📈 Phân tích dữ liệu (Analytics)**
    - Lượng khách theo ngày
    - Top điểm được thăm nhiều nhất
    - Thời gian trung bình tại mỗi điểm
    - Heatmap vị trí du khách

## 🚀 Cài đặt

### Yêu cầu hệ thống

- .NET 8.0 SDK trở lên
- Visual Studio 2022 hoặc Visual Studio Code
- Android SDK (cho Android)
- Xcode (cho iOS/macOS)

### Cài đặt dependencies

```bash
dotnet restore
```

### Chạy ứng dụng

#### Android
```bash
dotnet build -f net8.0-android
dotnet run -f net8.0-android
```

#### iOS
```bash
dotnet build -f net8.0-ios
dotnet run -f net8.0-ios
```

#### Windows
```bash
dotnet build -f net8.0-windows10.0.19041.0
dotnet run -f net8.0-windows10.0.19041.0
```

## 📁 Cấu trúc dự án

```
SmartTour/
├── Models/                 # Các model dữ liệu
│   ├── PointOfInterest.cs # Model cho điểm thuyết minh
│   ├── User.cs            # Model cho người dùng
│   ├── AccessLog.cs       # Model cho log truy cập
│   └── Tour.cs            # Model cho tour
├── Data/                  # Layer dữ liệu
│   └── DatabaseService.cs # SQLite database service
├── Services/              # Business logic
│   ├── GeofenceService.cs    # Xử lý geofencing
│   ├── NarrationService.cs   # Phát audio thuyết minh
│   └── AnalyticsService.cs   # Phân tích dữ liệu
├── ViewModels/            # MVVM ViewModels
│   ├── MainViewModel.cs      # ViewModel trang chính
│   └── AdminViewModel.cs     # ViewModel trang quản trị
├── Views/                 # UI Views
│   ├── MainPage.xaml         # Trang chính cho du khách
│   └── AdminPage.xaml        # Trang quản trị CMS
└── Resources/             # Tài nguyên (images, audio, styles)
```

## 🎯 Hướng dẫn sử dụng

### Cho du khách

1. **Khởi động ứng dụng**: Mở ứng dụng SmartTour
2. **Bật GPS**: Cho phép ứng dụng truy cập vị trí
3. **Bật theo dõi**: Bật công tắc "Theo dõi vị trí" 
4. **Di chuyển**: Khi đến gần điểm thuyết minh, app sẽ tự động phát nội dung
5. **Chọn ngôn ngữ**: Chọn Tiếng Việt hoặc English
6. **Xem danh sách**: Xem tất cả các điểm gần bạn
7. **Chỉ đường**: Nhấn nút "Chỉ đường" để mở bản đồ dẫn đường

### Cho quản trị viên

1. **Truy cập trang quản trị**: Vào menu Settings → Admin
2. **Quản lý POI**:
   - Thêm điểm mới: Nhấn "➕ Thêm mới"
   - Sửa thông tin: Nhấn "✏️ Sửa"
   - Upload ảnh: Nhấn "🖼️ Ảnh"
   - Upload audio: Nhấn "🎵 Audio"
   - Xóa điểm: Nhấn "🗑️ Xóa"
3. **Quản lý người dùng**:
   - Chuyển sang tab "👤 Quản lý người dùng"
   - Thêm/Sửa/Xóa người dùng
   - Phân quyền: Tourist, VIP, Staff, Admin
4. **Xem thống kê**:
   - Chuyển sang tab "📊 Thống kê"
   - Xem báo cáo 7 ngày gần nhất
   - Xuất báo cáo: Nhấn "📊 Xuất báo cáo"

## 🔧 Cấu hình

### Thay đổi bán kính kích hoạt

Trong file `DatabaseService.cs`, dòng 56:
```csharp
ActivationRadius = 50 // 50 mét
```

### Thay đổi khoảng thời gian cập nhật GPS

Trong file `GeofenceService.cs`, dòng 97:
```csharp
await Task.Delay(5000, cancellationToken); // 5 giây
```

### Thêm dữ liệu mẫu

Sửa method `SeedDataAsync()` trong `DatabaseService.cs` để thêm POI mới.

## 📊 Database Schema

### Bảng POIs (Points of Interest)
- Id (int, Primary Key)
- Name (string)
- Description (string)
- Latitude (double)
- Longitude (double)
- ImagePath (string)
- AudioPathVi (string)
- AudioPathEn (string)
- TTSScriptVi (string)
- TTSScriptEn (string)
- MapUrl (string)
- ActivationRadius (double)
- Category (string)
- Priority (int)
- IsActive (bool)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)

### Bảng Users
- Id (int, Primary Key)
- FullName (string)
- Email (string)
- PhoneNumber (string)
- FingerprintTemplate (string)
- RFIDTag (string)
- Role (enum: Tourist, VIP, Staff, Admin)
- TicketExpiryDate (DateTime?)
- RemainingAccess (int?)
- PreferredLanguage (string)
- IsActive (bool)
- CreatedAt (DateTime)
- LastAccessAt (DateTime)

### Bảng AccessLogs
- Id (int, Primary Key)
- UserId (int)
- POIId (int?)
- EventType (enum: Entry, Exit, POIVisit)
- Latitude (double?)
- Longitude (double?)
- Timestamp (DateTime)
- DurationMinutes (int?)
- Notes (string)
- AudioPlayed (bool)

### Bảng Tours
- Id (int, Primary Key)
- Name (string)
- Description (string)
- EstimatedDuration (int)
- Difficulty (string)
- POIIds (string)
- ThumbnailPath (string)
- IsActive (bool)
- CreatedAt (DateTime)

## 🎨 Màu sắc chủ đạo

- **Primary**: #0066CC (Xanh dương)
- **Secondary**: #FF6B35 (Cam)
- **Success**: #28A745 (Xanh lá)
- **Danger**: #DC3545 (Đỏ)

## 🔐 Quyền truy cập

Ứng dụng cần các quyền sau:
- **Location**: Để theo dõi vị trí GPS
- **Storage**: Để lưu trữ audio và hình ảnh
- **Internet**: Để đồng bộ dữ liệu (optional)

## 🐛 Troubleshooting

### Ứng dụng không phát thuyết minh
- Kiểm tra quyền truy cập vị trí
- Đảm bảo đã bật "Theo dõi vị trí"
- Kiểm tra khoảng cách đến POI

### Không tải được hình ảnh/audio
- Kiểm tra quyền truy cập storage
- Đảm bảo file tồn tại trong thư mục đúng

### GPS không chính xác
- Di chuyển ra ngoài trời
- Bật High Accuracy trong cài đặt điện thoại

## 📝 License

MIT License - Copyright (c) 2024 SmartTour

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issues.

## 📧 Liên hệ

Email: support@smarttour.com
Website: https://smarttour.com

---

**Phát triển bởi**: Nhóm SmartTour  
**Version**: 1.0.0  
**Ngày cập nhật**: 2024
