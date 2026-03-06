using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartTour.Data;
using SmartTour.Models;
using SmartTour.Services;
using System.Collections.ObjectModel;

namespace SmartTour.ViewModels
{
    public partial class AdminViewModel : ObservableObject
    {
        private readonly DatabaseService _database;
        private readonly AnalyticsService _analyticsService;

        public sealed record AudioUploadRequest(PointOfInterest Poi, string Language);

        [ObservableProperty]
        private ObservableCollection<PointOfInterest> _allPOIs = new();

        [ObservableProperty]
        private ObservableCollection<User> _allUsers = new();

        [ObservableProperty]
        private PointOfInterest? _selectedPOI;

        [ObservableProperty]
        private User? _selectedUser;

        [ObservableProperty]
        private string _statisticsReport = string.Empty;

        [ObservableProperty]
        private bool _isLoading = false;

        public AdminViewModel(DatabaseService database, AnalyticsService analyticsService)
        {
            _database = database;
            _analyticsService = analyticsService;
        }

        [RelayCommand]
        private async Task LoadDataAsync()
        {
            IsLoading = true;
            try
            {
                await _database.InitializeAsync();
                await LoadPOIsAsync();
                await LoadUsersAsync();
                await LoadStatisticsAsync();
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task LoadPOIsAsync()
        {
            var pois = await _database.GetPOIsAsync();
            AllPOIs.Clear();
            foreach (var poi in pois)
            {
                AllPOIs.Add(poi);
            }
        }

        [RelayCommand]
        private async Task LoadUsersAsync()
        {
            var users = await _database.GetUsersAsync();
            AllUsers.Clear();
            foreach (var user in users)
            {
                AllUsers.Add(user);
            }
        }

        [RelayCommand]
        private async Task AddPOIAsync()
        {
            var newPOI = new PointOfInterest
            {
                Name = "Điểm mới",
                Description = "Mô tả điểm mới",
                Latitude = 21.0285,
                Longitude = 105.8542,
                IsActive = true
            };

            await _database.SavePOIAsync(newPOI);
            await LoadPOIsAsync();
        }

        [RelayCommand]
        private async Task SavePOIAsync(PointOfInterest poi)
        {
            if (poi != null)
            {
                await _database.SavePOIAsync(poi);
                await LoadPOIsAsync();
            }
        }

        [RelayCommand]
        private async Task DeletePOIAsync(PointOfInterest poi)
        {
            if (poi != null)
            {
                bool confirm = await Application.Current!.MainPage!.DisplayAlert(
                    "Xác nhận",
                    $"Bạn có chắc muốn xóa {poi.Name}?",
                    "Xóa",
                    "Hủy"
                );

                if (confirm)
                {
                    await _database.DeletePOIAsync(poi);
                    await LoadPOIsAsync();
                }
            }
        }

        [RelayCommand]
        private async Task AddUserAsync()
        {
            var newUser = new User
            {
                FullName = "Người dùng mới",
                Role = UserRole.Tourist,
                IsActive = true,
                PreferredLanguage = "vi"
            };

            await _database.SaveUserAsync(newUser);
            await LoadUsersAsync();
        }

        [RelayCommand]
        private async Task SaveUserAsync(User user)
        {
            if (user != null)
            {
                await _database.SaveUserAsync(user);
                await LoadUsersAsync();
            }
        }

        [RelayCommand]
        private async Task DeleteUserAsync(User user)
        {
            if (user != null)
            {
                bool confirm = await Application.Current!.MainPage!.DisplayAlert(
                    "Xác nhận",
                    $"Bạn có chắc muốn xóa {user.FullName}?",
                    "Xóa",
                    "Hủy"
                );

                if (confirm)
                {
                    await _database.DeleteUserAsync(user);
                    await LoadUsersAsync();
                }
            }
        }

        [RelayCommand]
        private async Task LoadStatisticsAsync()
        {
            var endDate = DateTime.Now;
            var startDate = endDate.AddDays(-7);

            StatisticsReport = await _analyticsService.GenerateReportAsync(startDate, endDate);
        }

        [RelayCommand]
        private async Task ExportReportAsync()
        {
            try
            {
                var fileName = $"SmartTour_Report_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                var filePath = Path.Combine(FileSystem.CacheDirectory, fileName);

                await File.WriteAllTextAsync(filePath, StatisticsReport);

                await Share.Default.RequestAsync(new ShareFileRequest
                {
                    Title = "Xuất báo cáo",
                    File = new ShareFile(filePath)
                });
            }
            catch (Exception ex)
            {
                await Application.Current!.MainPage!.DisplayAlert(
                    "Lỗi",
                    $"Không thể xuất báo cáo: {ex.Message}",
                    "OK"
                );
            }
        }

        [RelayCommand]
        private async Task UploadAudioAsync(AudioUploadRequest request)
        {
            try
            {
                var poi = request.Poi;
                var language = request.Language;
                var audioFileTypes = new FilePickerFileType(new Dictionary<DevicePlatform, IEnumerable<string>>
                {
                    { DevicePlatform.Android, new[] { "audio/*" } },
                    { DevicePlatform.iOS, new[] { "public.audio" } },
                    { DevicePlatform.MacCatalyst, new[] { "public.audio" } },
                    { DevicePlatform.WinUI, new[] { ".mp3", ".wav", ".m4a" } }
                });

                var result = await FilePicker.Default.PickAsync(new PickOptions
                {
                    FileTypes = audioFileTypes,
                    PickerTitle = "Chọn file audio thuyết minh"
                });

                if (result != null)
                {
                    var destFolder = Path.Combine(FileSystem.AppDataDirectory, "Audio");
                    Directory.CreateDirectory(destFolder);
                    
                    var destPath = Path.Combine(destFolder, $"POI_{poi.Id}_{language}.mp3");
                    
                    using (var stream = await result.OpenReadAsync())
                    using (var destStream = File.Create(destPath))
                    {
                        await stream.CopyToAsync(destStream);
                    }

                    if (language == "vi")
                        poi.AudioPathVi = destPath;
                    else
                        poi.AudioPathEn = destPath;

                    await _database.SavePOIAsync(poi);
                    await LoadPOIsAsync();
                }
            }
            catch (Exception ex)
            {
                await Application.Current!.MainPage!.DisplayAlert(
                    "Lỗi",
                    $"Không thể tải file audio: {ex.Message}",
                    "OK"
                );
            }
        }

        [RelayCommand]
        private async Task UploadImageAsync(PointOfInterest poi)
        {
            try
            {
                var result = await FilePicker.Default.PickAsync(new PickOptions
                {
                    FileTypes = FilePickerFileType.Images,
                    PickerTitle = "Chọn hình ảnh"
                });

                if (result != null)
                {
                    var destFolder = Path.Combine(FileSystem.AppDataDirectory, "Images");
                    Directory.CreateDirectory(destFolder);
                    
                    var destPath = Path.Combine(destFolder, $"POI_{poi.Id}.jpg");
                    
                    using (var stream = await result.OpenReadAsync())
                    using (var destStream = File.Create(destPath))
                    {
                        await stream.CopyToAsync(destStream);
                    }

                    poi.ImagePath = destPath;
                    await _database.SavePOIAsync(poi);
                    await LoadPOIsAsync();
                }
            }
            catch (Exception ex)
            {
                await Application.Current!.MainPage!.DisplayAlert(
                    "Lỗi",
                    $"Không thể tải hình ảnh: {ex.Message}",
                    "OK"
                );
            }
        }
    }
}
