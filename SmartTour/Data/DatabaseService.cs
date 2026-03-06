using SQLite;
using SmartTour.Models;

namespace SmartTour.Data
{
    /// <summary>
    /// Dịch vụ quản lý cơ sở dữ liệu SQLite
    /// </summary>
    public class DatabaseService
    {
        private SQLiteAsyncConnection? _database;

        public async Task InitializeAsync()
        {
            if (_database != null)
                return;

            var dbPath = Path.Combine(FileSystem.AppDataDirectory, "smarttour.db3");
            _database = new SQLiteAsyncConnection(dbPath);

            // Tạo các bảng
            await _database.CreateTableAsync<PointOfInterest>();
            await _database.CreateTableAsync<User>();
            await _database.CreateTableAsync<AccessLog>();
            await _database.CreateTableAsync<Tour>();

            // Seed dữ liệu mẫu nếu chưa có
            await SeedDataAsync();
        }

        private async Task SeedDataAsync()
        {
            var poiCount = await _database!.Table<PointOfInterest>().CountAsync();
            
            if (poiCount == 0)
            {
                // Dữ liệu mẫu về các điểm du lịch ở Hà Nội
                var samplePOIs = new List<PointOfInterest>
                {
                    new PointOfInterest
                    {
                        Name = "Hồ Hoàn Kiếm",
                        Description = "Hồ Hoàn Kiếm là biểu tượng của Hà Nội, nơi gắn liền với truyền thuyết vua Lê Lợi trả gươm cho Thần Rùa.",
                        Latitude = 21.0285,
                        Longitude = 105.8542,
                        Category = "Hồ",
                        TTSScriptVi = "Chào mừng bạn đến với Hồ Hoàn Kiếm. Đây là biểu tượng của Hà Nội, nơi gắn liền với truyền thuyết vua Lê Lợi trả gươm cho Thần Rùa sau khi đánh thắng quân Minh.",
                        TTSScriptEn = "Welcome to Hoan Kiem Lake. This is the symbol of Hanoi, where the legend of King Le Loi returning the sword to the Golden Turtle God after defeating the Ming invaders took place.",
                        Priority = 1,
                        ActivationRadius = 100
                    },
                    new PointOfInterest
                    {
                        Name = "Đền Ngọc Sơn",
                        Description = "Đền Ngọc Sơn nằm trên đảo Ngọc ở giữa Hồ Hoàn Kiếm, được xây dựng để thờ Trần Hưng Đạo và Văn Xương Đế Quân.",
                        Latitude = 21.0294,
                        Longitude = 105.8521,
                        Category = "Đền",
                        TTSScriptVi = "Đền Ngọc Sơn nằm trên đảo Ngọc, được xây dựng vào thế kỷ 18. Đền thờ Trần Hưng Đạo, Văn Xương Đế Quân và La Tổ. Đây là nơi linh thiêng của người Hà Nội.",
                        TTSScriptEn = "Ngoc Son Temple is located on Jade Island, built in the 18th century. The temple worships Tran Hung Dao, Van Xuong De Quan and La To. This is a sacred place for Hanoians.",
                        Priority = 2,
                        ActivationRadius = 50
                    },
                    new PointOfInterest
                    {
                        Name = "Tháp Rùa",
                        Description = "Tháp Rùa là biểu tượng gắn liền với truyền thuyết Hồ Gươm, nơi Thần Rùa lấy lại thanh gươm của vua Lê Lợi.",
                        Latitude = 21.0277,
                        Longitude = 105.8523,
                        Category = "Tháp",
                        TTSScriptVi = "Tháp Rùa được xây dựng trên đảo Rùa giữa hồ. Theo truyền thuyết, sau khi đánh thắng quân Minh, vua Lê Lợi đi thuyền trên hồ, Thần Rùa hiện lên xin lại thanh gươm báu.",
                        TTSScriptEn = "Turtle Tower was built on Turtle Island in the middle of the lake. According to legend, after defeating the Ming army, King Le Loi was boating on the lake when the Golden Turtle God appeared to reclaim the precious sword.",
                        Priority = 3,
                        ActivationRadius = 75
                    },
                    new PointOfInterest
                    {
                        Name = "Cầu Thê Húc",
                        Description = "Cầu Thê Húc là cầu gỗ màu đỏ nối từ bờ hồ đến Đền Ngọc Sơn, được xây dựng vào năm 1865.",
                        Latitude = 21.0291,
                        Longitude = 105.8525,
                        Category = "Cầu",
                        TTSScriptVi = "Cầu Thê Húc, hay Cầu Đỏ, được xây dựng năm 1865. Tên cầu có nghĩa là 'nơi đón ánh mặt trời'. Cầu dẫn du khách từ bờ hồ đến Đền Ngọc Sơn.",
                        TTSScriptEn = "The Huc Bridge, also known as the Red Bridge, was built in 1865. The bridge's name means 'place where the morning sun shines'. It leads visitors from the lake shore to Ngoc Son Temple.",
                        Priority = 4,
                        ActivationRadius = 40
                    },
                    new PointOfInterest
                    {
                        Name = "Nhà Hát Lớn Hà Nội",
                        Description = "Nhà hát Lớn Hà Nội là công trình kiến trúc Pháp nổi tiếng, được xây dựng từ năm 1901-1911.",
                        Latitude = 21.0233,
                        Longitude = 105.8571,
                        Category = "Nhà hát",
                        TTSScriptVi = "Nhà hát Lớn Hà Nội được xây dựng theo kiểu kiến trúc Pháp từ năm 1901 đến 1911. Đây là nơi diễn ra các sự kiện văn hóa nghệ thuật quan trọng của Việt Nam.",
                        TTSScriptEn = "Hanoi Opera House was built in French architectural style from 1901 to 1911. This is where important cultural and artistic events of Vietnam take place.",
                        Priority = 5,
                        ActivationRadius = 60
                    }
                };

                await _database.InsertAllAsync(samplePOIs);
            }

            // Tạo user admin mặc định
            var adminCount = await _database.Table<User>().Where(u => u.Role == UserRole.Admin).CountAsync();
            if (adminCount == 0)
            {
                var admin = new User
                {
                    FullName = "Admin",
                    Email = "admin@smarttour.com",
                    Role = UserRole.Admin,
                    PreferredLanguage = "vi",
                    IsActive = true
                };
                await _database.InsertAsync(admin);
            }
        }

        #region POI Methods

        public async Task<List<PointOfInterest>> GetPOIsAsync()
        {
            await InitializeAsync();
            return await _database!.Table<PointOfInterest>()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Priority)
                .ToListAsync();
        }

        public async Task<PointOfInterest?> GetPOIAsync(int id)
        {
            await InitializeAsync();
            return await _database!.Table<PointOfInterest>()
                .Where(p => p.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<int> SavePOIAsync(PointOfInterest poi)
        {
            await InitializeAsync();
            poi.UpdatedAt = DateTime.Now;
            
            if (poi.Id != 0)
                return await _database!.UpdateAsync(poi);
            else
            {
                poi.CreatedAt = DateTime.Now;
                return await _database!.InsertAsync(poi);
            }
        }

        public async Task<int> DeletePOIAsync(PointOfInterest poi)
        {
            await InitializeAsync();
            return await _database!.DeleteAsync(poi);
        }

        /// <summary>
        /// Tìm POI gần vị trí hiện tại
        /// </summary>
        public async Task<List<PointOfInterest>> GetNearbyPOIsAsync(double latitude, double longitude, double radiusKm = 1.0)
        {
            await InitializeAsync();
            var allPOIs = await GetPOIsAsync();
            
            return allPOIs.Where(poi =>
            {
                var distance = CalculateDistance(latitude, longitude, poi.Latitude, poi.Longitude);
                return distance <= radiusKm;
            }).ToList();
        }

        #endregion

        #region User Methods

        public async Task<List<User>> GetUsersAsync()
        {
            await InitializeAsync();
            return await _database!.Table<User>()
                .Where(u => u.IsActive)
                .ToListAsync();
        }

        public async Task<User?> GetUserAsync(int id)
        {
            await InitializeAsync();
            return await _database!.Table<User>()
                .Where(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserByFingerprintAsync(string fingerprintTemplate)
        {
            await InitializeAsync();
            return await _database!.Table<User>()
                .Where(u => u.FingerprintTemplate == fingerprintTemplate && u.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserByRFIDAsync(string rfidTag)
        {
            await InitializeAsync();
            return await _database!.Table<User>()
                .Where(u => u.RFIDTag == rfidTag && u.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<int> SaveUserAsync(User user)
        {
            await InitializeAsync();
            
            if (user.Id != 0)
                return await _database!.UpdateAsync(user);
            else
            {
                user.CreatedAt = DateTime.Now;
                return await _database!.InsertAsync(user);
            }
        }

        public async Task<int> DeleteUserAsync(User user)
        {
            await InitializeAsync();
            return await _database!.DeleteAsync(user);
        }

        #endregion

        #region AccessLog Methods

        public async Task<int> SaveAccessLogAsync(AccessLog log)
        {
            await InitializeAsync();
            return await _database!.InsertAsync(log);
        }

        public async Task<List<AccessLog>> GetAccessLogsAsync(int userId)
        {
            await InitializeAsync();
            return await _database!.Table<AccessLog>()
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.Timestamp)
                .ToListAsync();
        }

        public async Task<List<AccessLog>> GetAccessLogsByDateAsync(DateTime date)
        {
            await InitializeAsync();
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);
            
            return await _database!.Table<AccessLog>()
                .Where(l => l.Timestamp >= startDate && l.Timestamp < endDate)
                .OrderByDescending(l => l.Timestamp)
                .ToListAsync();
        }

        public async Task<List<AccessLog>> GetPOIVisitLogsAsync(int poiId)
        {
            await InitializeAsync();
            return await _database!.Table<AccessLog>()
                .Where(l => l.POIId == poiId && l.EventType == AccessEventType.POIVisit)
                .OrderByDescending(l => l.Timestamp)
                .ToListAsync();
        }

        #endregion

        #region Tour Methods

        public async Task<List<Tour>> GetToursAsync()
        {
            await InitializeAsync();
            return await _database!.Table<Tour>()
                .Where(t => t.IsActive)
                .ToListAsync();
        }

        public async Task<Tour?> GetTourAsync(int id)
        {
            await InitializeAsync();
            return await _database!.Table<Tour>()
                .Where(t => t.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<int> SaveTourAsync(Tour tour)
        {
            await InitializeAsync();
            
            if (tour.Id != 0)
                return await _database!.UpdateAsync(tour);
            else
            {
                tour.CreatedAt = DateTime.Now;
                return await _database!.InsertAsync(tour);
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Tính khoảng cách giữa 2 điểm GPS (km) sử dụng công thức Haversine
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

        #endregion
    }
}
