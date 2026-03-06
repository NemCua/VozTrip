using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartTour.Data;
using SmartTour.Models;
using SmartTour.Services;
using System.Collections.ObjectModel;

namespace SmartTour.ViewModels
{
    public partial class MainViewModel : ObservableObject
    {
        private readonly DatabaseService _database;
        private readonly GeofenceService _geofenceService;
        private readonly NarrationService _narrationService;
        private readonly AnalyticsService _analyticsService;

        [ObservableProperty]
        private ObservableCollection<PointOfInterest> _nearbyPOIs = new();

        [ObservableProperty]
        private PointOfInterest? _selectedPOI;

        [ObservableProperty]
        private string _currentLocationText = "Đang tải vị trí...";

        [ObservableProperty]
        private bool _isMonitoring = false;

        [ObservableProperty]
        private User? _currentUser;

        [ObservableProperty]
        private string _selectedLanguage = "vi";

        public MainViewModel(
            DatabaseService database, 
            GeofenceService geofenceService,
            NarrationService narrationService,
            AnalyticsService analyticsService)
        {
            _database = database;
            _geofenceService = geofenceService;
            _narrationService = narrationService;
            _analyticsService = analyticsService;

            // Subscribe to geofence events
            _geofenceService.POITriggered += OnPOITriggered;
        }

        [RelayCommand]
        private async Task InitializeAsync()
        {
            await _database.InitializeAsync();
            await LoadNearbyPOIsAsync();
        }

        [RelayCommand]
        private async Task StartMonitoringAsync()
        {
            IsMonitoring = true;
            await _geofenceService.StartMonitoringAsync();
        }

        [RelayCommand]
        private void StopMonitoring()
        {
            IsMonitoring = false;
            _geofenceService.StopMonitoring();
        }

        [RelayCommand]
        private async Task LoadNearbyPOIsAsync()
        {
            try
            {
                var location = _geofenceService.GetCurrentLocation();
                
                if (location != null)
                {
                    CurrentLocationText = $"Vị trí: {location.Latitude:F4}, {location.Longitude:F4}";
                    
                    var pois = await _database.GetNearbyPOIsAsync(
                        location.Latitude, 
                        location.Longitude, 
                        5.0 // 5km radius
                    );

                    NearbyPOIs.Clear();
                    foreach (var poi in pois)
                    {
                        NearbyPOIs.Add(poi);
                    }
                }
                else
                {
                    // Nếu không có vị trí, load tất cả POIs
                    var allPOIs = await _database.GetPOIsAsync();
                    NearbyPOIs.Clear();
                    foreach (var poi in allPOIs)
                    {
                        NearbyPOIs.Add(poi);
                    }
                    CurrentLocationText = "Không xác định được vị trí";
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading POIs: {ex.Message}");
            }
        }

        [RelayCommand]
        private async Task SelectPOIAsync(PointOfInterest poi)
        {
            SelectedPOI = poi;
            
            // Phát thuyết minh
            await _narrationService.PlayNarrationAsync(poi, SelectedLanguage);

            // Ghi log nếu có user
            if (CurrentUser != null)
            {
                var location = _geofenceService.GetCurrentLocation();
                await _analyticsService.LogAccessAsync(
                    CurrentUser.Id,
                    AccessEventType.POIVisit,
                    poi.Id,
                    location?.Latitude,
                    location?.Longitude
                );
            }
        }

        [RelayCommand]
        private async Task StopNarrationAsync()
        {
            await _narrationService.StopNarrationAsync();
        }

        [RelayCommand]
        private void ChangeLanguage(string language)
        {
            SelectedLanguage = language;
            _narrationService.SetLanguage(language);
        }

        private async void OnPOITriggered(object? sender, POITriggeredEventArgs e)
        {
            // Tự động phát thuyết minh khi đến gần POI
            await MainThread.InvokeOnMainThreadAsync(async () =>
            {
                await SelectPOIAsync(e.POI);
            });
        }

        [RelayCommand]
        private async Task NavigateToPOIAsync(PointOfInterest poi)
        {
            try
            {
                var location = new Location(poi.Latitude, poi.Longitude);
                var options = new MapLaunchOptions 
                { 
                    Name = poi.Name,
                    NavigationMode = NavigationMode.Driving
                };

                await Map.Default.OpenAsync(location, options);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Navigation error: {ex.Message}");
            }
        }

        public async Task LoginUserAsync(string identifier)
        {
            // Tìm user theo RFID hoặc fingerprint
            var user = await _database.GetUserByRFIDAsync(identifier);
            
            if (user == null)
            {
                user = await _database.GetUserByFingerprintAsync(identifier);
            }

            if (user != null)
            {
                CurrentUser = user;
                SelectedLanguage = user.PreferredLanguage;
                
                // Log entry
                var location = _geofenceService.GetCurrentLocation();
                await _analyticsService.LogAccessAsync(
                    user.Id,
                    AccessEventType.Entry,
                    null,
                    location?.Latitude,
                    location?.Longitude
                );
            }
        }

        public async Task LogoutUserAsync()
        {
            if (CurrentUser != null)
            {
                var location = _geofenceService.GetCurrentLocation();
                await _analyticsService.LogAccessAsync(
                    CurrentUser.Id,
                    AccessEventType.Exit,
                    null,
                    location?.Latitude,
                    location?.Longitude
                );

                CurrentUser = null;
            }
        }

        [RelayCommand]
        private async Task LogoutAsync()
        {
            await LogoutUserAsync();
        }
    }
}
