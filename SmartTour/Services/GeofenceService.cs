using SmartTour.Data;
using SmartTour.Models;

namespace SmartTour.Services
{
    /// <summary>
    /// Service xử lý Geofencing - phát hiện khi người dùng vào vùng POI
    /// </summary>
    public class GeofenceService
    {
        private readonly DatabaseService _database;
        private Location? _currentLocation;
        private bool _isMonitoring = false;
        private CancellationTokenSource? _cts;

        public event EventHandler<POITriggeredEventArgs>? POITriggered;

        public GeofenceService(DatabaseService database)
        {
            _database = database;
        }

        /// <summary>
        /// Bắt đầu theo dõi vị trí
        /// </summary>
        public async Task StartMonitoringAsync()
        {
            if (_isMonitoring)
                return;

            _isMonitoring = true;
            _cts = new CancellationTokenSource();

            // Yêu cầu quyền truy cập vị trí
            var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
            if (status != PermissionStatus.Granted)
            {
                status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            }

            if (status != PermissionStatus.Granted)
            {
                _isMonitoring = false;
                return;
            }

            // Bắt đầu theo dõi vị trí
            _ = Task.Run(async () => await MonitorLocationAsync(_cts.Token));
        }

        /// <summary>
        /// Dừng theo dõi vị trí
        /// </summary>
        public void StopMonitoring()
        {
            _isMonitoring = false;
            _cts?.Cancel();
        }

        /// <summary>
        /// Lấy vị trí hiện tại
        /// </summary>
        public Location? GetCurrentLocation() => _currentLocation;

        private async Task MonitorLocationAsync(CancellationToken cancellationToken)
        {
            while (_isMonitoring && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var location = await Geolocation.GetLocationAsync(new GeolocationRequest
                    {
                        DesiredAccuracy = GeolocationAccuracy.Medium,
                        Timeout = TimeSpan.FromSeconds(10)
                    });

                    if (location != null)
                    {
                        _currentLocation = location;
                        await CheckGeofencesAsync(location);
                    }

                    // Kiểm tra mỗi 5 giây
                    await Task.Delay(5000, cancellationToken);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Geofence error: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Kiểm tra xem có POI nào trong phạm vi không
        /// </summary>
        private async Task CheckGeofencesAsync(Location location)
        {
            var pois = await _database.GetPOIsAsync();

            foreach (var poi in pois)
            {
                var distance = CalculateDistance(
                    location.Latitude, 
                    location.Longitude,
                    poi.Latitude, 
                    poi.Longitude
                );

                // Nếu trong bán kính kích hoạt (chuyển từ mét sang km)
                if (distance <= (poi.ActivationRadius / 1000.0))
                {
                    OnPOITriggered(poi, distance);
                }
            }
        }

        /// <summary>
        /// Tính khoảng cách giữa 2 điểm GPS (km)
        /// </summary>
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Bán kính Trái Đất (km)

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        protected virtual void OnPOITriggered(PointOfInterest poi, double distance)
        {
            POITriggered?.Invoke(this, new POITriggeredEventArgs(poi, distance));
        }
    }

    public class POITriggeredEventArgs : EventArgs
    {
        public PointOfInterest POI { get; }
        public double Distance { get; }

        public POITriggeredEventArgs(PointOfInterest poi, double distance)
        {
            POI = poi;
            Distance = distance;
        }
    }
}
