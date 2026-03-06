# Hướng dẫn Build SmartTour

## Yêu cầu hệ thống

### Windows
- Windows 10/11 (64-bit)
- Visual Studio 2022 (17.8 trở lên)
- Workloads:
  - .NET Multi-platform App UI development
  - Mobile development with .NET
- .NET 8.0 SDK

### macOS
- macOS 13 (Ventura) trở lên
- Xcode 15 trở lên
- .NET 8.0 SDK
- Visual Studio for Mac hoặc VS Code

### Linux
- Ubuntu 20.04/22.04 hoặc tương đương
- .NET 8.0 SDK
- VS Code với C# extension

## Cài đặt .NET MAUI

### Windows

1. Cài đặt Visual Studio 2022:
```bash
# Download từ: https://visualstudio.microsoft.com/downloads/
```

2. Chọn workload:
- ✅ .NET Multi-platform App UI development
- ✅ Mobile development with .NET

3. Cài đặt .NET MAUI CLI:
```bash
dotnet workload install maui
```

### macOS

1. Cài đặt Xcode từ App Store

2. Cài đặt .NET 8 SDK:
```bash
# Download từ: https://dotnet.microsoft.com/download
```

3. Cài đặt .NET MAUI workload:
```bash
dotnet workload install maui
dotnet workload install maui-ios
dotnet workload install maui-maccatalyst
```

## Build ứng dụng

### 1. Clone repository

```bash
git clone https://github.com/your-repo/SmartTour.git
cd SmartTour
```

### 2. Restore dependencies

```bash
cd SmartTour
dotnet restore
```

### 3. Build cho từng platform

#### Android

```bash
# Debug build
dotnet build -f net8.0-android -c Debug

# Release build
dotnet build -f net8.0-android -c Release

# Tạo APK
dotnet publish -f net8.0-android -c Release
```

APK file sẽ được tạo tại: `bin/Release/net8.0-android/publish/`

#### iOS

```bash
# Debug build
dotnet build -f net8.0-ios -c Debug

# Release build
dotnet build -f net8.0-ios -c Release

# Tạo IPA (cần provisioning profile)
dotnet publish -f net8.0-ios -c Release /p:ArchiveOnBuild=true
```

#### Windows

```bash
# Debug build
dotnet build -f net8.0-windows10.0.19041.0 -c Debug

# Release build
dotnet build -f net8.0-windows10.0.19041.0 -c Release

# Tạo MSIX
dotnet publish -f net8.0-windows10.0.19041.0 -c Release
```

## Chạy ứng dụng

### Android Emulator

1. Mở Android Studio → AVD Manager
2. Tạo hoặc khởi động emulator
3. Chạy app:

```bash
dotnet build -f net8.0-android -c Debug -t:Run
```

### iOS Simulator

```bash
dotnet build -f net8.0-ios -c Debug -t:Run
```

### Windows Desktop

```bash
dotnet run -f net8.0-windows10.0.19041.0
```

## Cấu hình cho Release

### Android

Chỉnh sửa `SmartTour.csproj`:

```xml
<PropertyGroup Condition="'$(Configuration)|$(TargetFramework)|$(Platform)'=='Release|net8.0-android|AnyCPU'">
  <AndroidPackageFormat>aab</AndroidPackageFormat>
  <AndroidUseAapt2>true</AndroidUseAapt2>
  <AndroidCreatePackagePerAbi>false</AndroidCreatePackagePerAbi>
  <AndroidKeyStore>true</AndroidKeyStore>
  <AndroidSigningKeyStore>smarttour.keystore</AndroidSigningKeyStore>
  <AndroidSigningKeyAlias>smarttour</AndroidSigningKeyAlias>
  <AndroidSigningKeyPass>your-password</AndroidSigningKeyPass>
  <AndroidSigningStorePass>your-password</AndroidSigningStorePass>
</PropertyGroup>
```

Tạo keystore:

```bash
keytool -genkey -v -keystore smarttour.keystore -alias smarttour -keyalg RSA -keysize 2048 -validity 10000
```

### iOS

1. Cần Apple Developer Account
2. Tạo provisioning profile
3. Cấu hình signing trong `Info.plist`:

```xml
<key>CFBundleIdentifier</key>
<string>com.smarttour.app</string>
```

## Deployment

### Android - Google Play Store

1. Build AAB file:
```bash
dotnet publish -f net8.0-android -c Release
```

2. Upload lên Google Play Console

3. Điền thông tin app:
   - Tên: SmartTour
   - Mô tả: Hệ thống thuyết minh du lịch thông minh
   - Screenshots: Chuẩn bị ảnh cho các kích thước màn hình

### iOS - App Store

1. Build với Xcode:
   - Open `SmartTour.sln` in Visual Studio Mac
   - Archive → Upload to App Store

2. App Store Connect:
   - Tạo app mới
   - Upload build
   - Submit for review

### Windows - Microsoft Store

1. Tạo MSIX package:
```bash
dotnet publish -f net8.0-windows10.0.19041.0 -c Release
```

2. Upload lên Partner Center

## Testing

### Unit Tests

```bash
dotnet test
```

### UI Tests (Appium)

```bash
# Cài đặt Appium
npm install -g appium

# Chạy tests
dotnet test --filter Category=UITests
```

## Continuous Integration

### GitHub Actions

Tạo file `.github/workflows/build.yml`:

```yaml
name: Build SmartTour

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    - name: Install MAUI
      run: dotnet workload install maui
    - name: Build Android
      run: dotnet build -f net8.0-android -c Release

  build-ios:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    - name: Install MAUI
      run: dotnet workload install maui maui-ios
    - name: Build iOS
      run: dotnet build -f net8.0-ios -c Release

  build-windows:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    - name: Install MAUI
      run: dotnet workload install maui
    - name: Build Windows
      run: dotnet build -f net8.0-windows10.0.19041.0 -c Release
```

## Troubleshooting

### Lỗi build Android

**Lỗi**: `INSTALL_FAILED_UPDATE_INCOMPATIBLE`

**Giải pháp**:
```bash
adb uninstall com.smarttour.app
```

### Lỗi build iOS

**Lỗi**: `No valid iOS code signing keys found`

**Giải pháp**: 
- Mở Xcode → Preferences → Accounts
- Add Apple ID
- Download Manual Profiles

### Lỗi restore dependencies

**Lỗi**: `Package restore failed`

**Giải pháp**:
```bash
dotnet nuget locals all --clear
dotnet restore --force
```

## Performance Optimization

### Android

1. Enable ProGuard/R8:
```xml
<AndroidEnableProguard>true</AndroidEnableProguard>
<AndroidLinkMode>Full</AndroidLinkMode>
```

2. Enable AOT compilation:
```xml
<RunAOTCompilation>true</RunAOTCompilation>
```

### iOS

1. Enable LLVM:
```xml
<MtouchUseLlvm>true</MtouchUseLlvm>
```

2. Enable bitcode:
```xml
<MtouchEnableBitcode>true</MtouchEnableBitcode>
```

## Version Management

### Cập nhật version number

Trong `SmartTour.csproj`:

```xml
<ApplicationDisplayVersion>1.0</ApplicationDisplayVersion>
<ApplicationVersion>1</ApplicationVersion>
```

- `ApplicationDisplayVersion`: Version hiển thị (1.0, 1.1, 2.0)
- `ApplicationVersion`: Build number (1, 2, 3, ...)

## Changelog

### Version 1.0.0 (2024-02-10)
- ✅ Release đầu tiên
- ✅ Tính năng Map View
- ✅ CMS quản trị nội dung
- ✅ QR Code kích hoạt
- ✅ Geofencing tự động
- ✅ Text-to-Speech
- ✅ Analytics

## Support

Gặp vấn đề khi build? Liên hệ:
- Email: dev@smarttour.com
- Issues: https://github.com/your-repo/SmartTour/issues
