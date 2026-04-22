using Microsoft.EntityFrameworkCore;
using back_end_vozTrip.Models;

namespace back_end_vozTrip.Services;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Poi> Pois => Set<Poi>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<PoiLocalization> PoiLocalizations => Set<PoiLocalization>();
    public DbSet<PoiMedia> PoiMedia => Set<PoiMedia>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<GuestSession> GuestSessions => Set<GuestSession>();
    public DbSet<VisitLog> VisitLogs => Set<VisitLog>();
    public DbSet<UsageLog> UsageLogs => Set<UsageLog>();
    public DbSet<DeviceRecord> DeviceRecords => Set<DeviceRecord>();
    public DbSet<FeedbackReport> FeedbackReports => Set<FeedbackReport>();
    public DbSet<FeatureFlag>    FeatureFlags     => Set<FeatureFlag>();
    public DbSet<PaymentOrder>   PaymentOrders    => Set<PaymentOrder>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        // users
        model.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.UserId);
            e.Property(u => u.UserId).HasColumnName("user_id");
            e.Property(u => u.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(u => u.Role).HasColumnName("role").HasMaxLength(20).IsRequired();
            e.Property(u => u.FullName).HasColumnName("full_name").HasMaxLength(200);
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(200);
            e.Property(u => u.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
        });

        // sellers
        model.Entity<Seller>(e =>
        {
            e.ToTable("sellers");
            e.HasKey(s => s.SellerId);
            e.Property(s => s.SellerId).HasColumnName("seller_id");
            e.Property(s => s.ShopName).HasColumnName("shop_name").HasMaxLength(200).IsRequired();
            e.Property(s => s.ShopLogo).HasColumnName("shop_logo").HasMaxLength(500);
            e.Property(s => s.ContactPhone).HasColumnName("contact_phone").HasMaxLength(20);
            e.Property(s => s.Description).HasColumnName("description");
            e.Property(s => s.ApprovedAt).HasColumnName("approved_at");
            e.Property(s => s.ApprovedBy).HasColumnName("approved_by");
            e.Property(s => s.Plan).HasColumnName("plan").HasMaxLength(20).HasDefaultValue("free");
            e.Property(s => s.PlanUpgradedAt).HasColumnName("plan_upgraded_at");

            e.HasOne(s => s.User)
             .WithOne(u => u.Seller)
             .HasForeignKey<Seller>(s => s.SellerId);

            e.HasOne(s => s.ApprovedByUser)
             .WithMany()
             .HasForeignKey(s => s.ApprovedBy)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // zones
        model.Entity<Zone>(e =>
        {
            e.ToTable("zones");
            e.HasKey(z => z.ZoneId);
            e.Property(z => z.ZoneId).HasColumnName("zone_id");
            e.Property(z => z.ZoneName).HasColumnName("zone_name").HasMaxLength(100).IsRequired();
            e.Property(z => z.Description).HasColumnName("description");
        });

        // pois
        model.Entity<Poi>(e =>
        {
            e.ToTable("pois");
            e.HasKey(p => p.PoiId);
            e.Property(p => p.PoiId).HasColumnName("poi_id");
            e.Property(p => p.SellerId).HasColumnName("seller_id").IsRequired();
            e.Property(p => p.ZoneId).HasColumnName("zone_id");
            e.Property(p => p.PoiName).HasColumnName("poi_name").HasMaxLength(200).IsRequired();
            e.Property(p => p.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(p => p.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(p => p.TriggerRadius).HasColumnName("trigger_radius").HasDefaultValue(10.0);
            e.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(p => p.IsFeatured).HasColumnName("is_featured").HasDefaultValue(false);
            e.Property(p => p.FeaturedUntil).HasColumnName("featured_until");
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");

            e.HasOne(p => p.Seller)
             .WithMany(s => s.Pois)
             .HasForeignKey(p => p.SellerId);

            e.HasOne(p => p.Zone)
             .WithMany(z => z.Pois)
             .HasForeignKey(p => p.ZoneId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // languages
        model.Entity<Language>(e =>
        {
            e.ToTable("languages");
            e.HasKey(l => l.LanguageId);
            e.Property(l => l.LanguageId).HasColumnName("language_id");
            e.Property(l => l.LanguageCode).HasColumnName("language_code").HasMaxLength(10).IsRequired();
            e.HasIndex(l => l.LanguageCode).IsUnique();
            e.Property(l => l.LanguageName).HasColumnName("language_name").HasMaxLength(100);
            e.Property(l => l.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        });

        // poi_localizations
        model.Entity<PoiLocalization>(e =>
        {
            e.ToTable("poi_localizations");
            e.HasKey(pl => pl.LocalizationId);
            e.Property(pl => pl.LocalizationId).HasColumnName("localization_id");
            e.Property(pl => pl.PoiId).HasColumnName("poi_id").IsRequired();
            e.Property(pl => pl.LanguageId).HasColumnName("language_id").IsRequired();
            e.Property(pl => pl.Title).HasColumnName("title").HasMaxLength(200);
            e.Property(pl => pl.Description).HasColumnName("description");
            e.Property(pl => pl.AudioUrl).HasColumnName("audio_url").HasMaxLength(500);
            e.Property(pl => pl.AudioPublicId).HasColumnName("audio_public_id").HasMaxLength(200);
            e.Property(pl => pl.AudioDuration).HasColumnName("audio_duration");
            e.Property(pl => pl.IsAutoTranslated).HasColumnName("is_auto_translated").HasDefaultValue(false);
            e.HasIndex(pl => new { pl.PoiId, pl.LanguageId }).IsUnique();

            e.HasOne(pl => pl.Poi)
             .WithMany(p => p.Localizations)
             .HasForeignKey(pl => pl.PoiId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(pl => pl.Language)
             .WithMany(l => l.PoiLocalizations)
             .HasForeignKey(pl => pl.LanguageId);
        });

        // poi_media
        model.Entity<PoiMedia>(e =>
        {
            e.ToTable("poi_media");
            e.HasKey(m => m.MediaId);
            e.Property(m => m.MediaId).HasColumnName("media_id");
            e.Property(m => m.PoiId).HasColumnName("poi_id").IsRequired();
            e.Property(m => m.MediaType).HasColumnName("media_type").HasMaxLength(20).IsRequired();
            e.Property(m => m.MediaUrl).HasColumnName("media_url").HasMaxLength(500).IsRequired();
            e.Property(m => m.PublicId).HasColumnName("public_id").HasMaxLength(200).IsRequired();
            e.Property(m => m.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);

            e.HasOne(m => m.Poi)
             .WithMany(p => p.Media)
             .HasForeignKey(m => m.PoiId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // questions
        model.Entity<Question>(e =>
        {
            e.ToTable("questions");
            e.HasKey(q => q.QuestionId);
            e.Property(q => q.QuestionId).HasColumnName("question_id");
            e.Property(q => q.PoiId).HasColumnName("poi_id").IsRequired();
            e.Property(q => q.LanguageId).HasColumnName("language_id").IsRequired();
            e.Property(q => q.QuestionText).HasColumnName("question_text").HasMaxLength(500).IsRequired();
            e.Property(q => q.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);
            e.Property(q => q.IsActive).HasColumnName("is_active").HasDefaultValue(true);

            e.HasOne(q => q.Poi)
             .WithMany(p => p.Questions)
             .HasForeignKey(q => q.PoiId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(q => q.Language)
             .WithMany(l => l.Questions)
             .HasForeignKey(q => q.LanguageId);
        });

        // answers
        model.Entity<Answer>(e =>
        {
            e.ToTable("answers");
            e.HasKey(a => a.AnswerId);
            e.Property(a => a.AnswerId).HasColumnName("answer_id");
            e.Property(a => a.QuestionId).HasColumnName("question_id").IsRequired();
            e.Property(a => a.PoiId).HasColumnName("poi_id").IsRequired();
            e.Property(a => a.LanguageId).HasColumnName("language_id").IsRequired();
            e.Property(a => a.AnswerText).HasColumnName("answer_text").IsRequired();
            e.Property(a => a.AudioUrl).HasColumnName("audio_url").HasMaxLength(500);
            e.Property(a => a.AudioPublicId).HasColumnName("audio_public_id").HasMaxLength(200);

            e.HasOne(a => a.Question)
             .WithOne(q => q.Answer)
             .HasForeignKey<Answer>(a => a.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Poi)
             .WithMany()
             .HasForeignKey(a => a.PoiId);

            e.HasOne(a => a.Language)
             .WithMany(l => l.Answers)
             .HasForeignKey(a => a.LanguageId);
        });

        // guest_sessions
        model.Entity<GuestSession>(e =>
        {
            e.ToTable("guest_sessions");
            e.HasKey(g => g.SessionId);
            e.Property(g => g.SessionId).HasColumnName("session_id");
            e.Property(g => g.LanguageId).HasColumnName("language_id");
            e.Property(g => g.StartedAt).HasColumnName("started_at").HasDefaultValueSql("NOW()");

            e.HasOne(g => g.Language)
             .WithMany(l => l.GuestSessions)
             .HasForeignKey(g => g.LanguageId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // visit_logs
        model.Entity<VisitLog>(e =>
        {
            e.ToTable("visit_logs");
            e.HasKey(v => v.LogId);
            e.Property(v => v.LogId).HasColumnName("log_id");
            e.Property(v => v.SessionId).HasColumnName("session_id");
            e.Property(v => v.PoiId).HasColumnName("poi_id");
            e.Property(v => v.TriggeredAt).HasColumnName("triggered_at").HasDefaultValueSql("NOW()");

            e.HasOne(v => v.GuestSession)
             .WithMany(g => g.VisitLogs)
             .HasForeignKey(v => v.SessionId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(v => v.Poi)
             .WithMany(p => p.VisitLogs)
             .HasForeignKey(v => v.PoiId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // device_records
        model.Entity<DeviceRecord>(e =>
        {
            e.ToTable("device_records");
            e.HasKey(d => d.DeviceId);
            e.Property(d => d.DeviceId).HasColumnName("device_id");
            e.Property(d => d.Platform).HasColumnName("platform").HasMaxLength(20).IsRequired();
            e.Property(d => d.OsVersion).HasColumnName("os_version").HasMaxLength(50);
            e.Property(d => d.JoinedAt).HasColumnName("joined_at").HasDefaultValueSql("NOW()");
            e.Property(d => d.LastSeenAt).HasColumnName("last_seen_at");
            e.Property(d => d.Approved).HasColumnName("approved").HasDefaultValue(false);
            e.Property(d => d.ApprovedAt).HasColumnName("approved_at");
        });

        // feedback_reports
        model.Entity<FeedbackReport>(e =>
        {
            e.ToTable("feedback_reports");
            e.HasKey(f => f.ReportId);
            e.Property(f => f.ReportId).HasColumnName("report_id");
            e.Property(f => f.SessionId).HasColumnName("session_id");
            e.Property(f => f.DeviceId).HasColumnName("device_id");
            e.Property(f => f.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            e.Property(f => f.Message).HasColumnName("message").HasMaxLength(1000).IsRequired();
            e.Property(f => f.PoiId).HasColumnName("poi_id");
            e.Property(f => f.Platform).HasColumnName("platform").HasMaxLength(20).HasDefaultValue("web");
            e.Property(f => f.Lang).HasColumnName("lang").HasMaxLength(10).HasDefaultValue("vi");
            e.Property(f => f.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(f => f.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("pending");
            e.Property(f => f.AdminNote).HasColumnName("admin_note");
            e.Property(f => f.ReviewedAt).HasColumnName("reviewed_at");
            e.HasIndex(f => f.Status);
            e.HasIndex(f => f.CreatedAt);
        });

        // feature_flags
        model.Entity<FeatureFlag>(e =>
        {
            e.ToTable("feature_flags");
            e.HasKey(f => f.Key);
            e.Property(f => f.Key).HasColumnName("key").HasMaxLength(80).IsRequired();
            e.Property(f => f.Enabled).HasColumnName("enabled").HasDefaultValue(true);
            e.Property(f => f.Label).HasColumnName("label").HasMaxLength(120);
            e.Property(f => f.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
        });

        // payment_orders
        model.Entity<PaymentOrder>(e =>
        {
            e.ToTable("payment_orders");
            e.HasKey(p => p.OrderId);
            e.Property(p => p.OrderId).HasColumnName("order_id");
            e.Property(p => p.SellerId).HasColumnName("seller_id").IsRequired();
            e.Property(p => p.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            e.Property(p => p.PoiId).HasColumnName("poi_id");
            e.Property(p => p.Amount).HasColumnName("amount").IsRequired();
            e.Property(p => p.OrderCode).HasColumnName("order_code").HasMaxLength(30).IsRequired();
            e.HasIndex(p => p.OrderCode).IsUnique();
            e.Property(p => p.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("pending");
            e.HasIndex(p => p.Status);
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(p => p.PaidAt).HasColumnName("paid_at");

            e.HasOne(p => p.Seller)
             .WithMany()
             .HasForeignKey(p => p.SellerId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(p => p.Poi)
             .WithMany()
             .HasForeignKey(p => p.PoiId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // usage_logs — session_id là metadata thuần, không có FK constraint
        model.Entity<UsageLog>(e =>
        {
            e.ToTable("usage_logs");
            e.HasKey(u => u.LogId);
            e.Property(u => u.LogId).HasColumnName("log_id");
            e.Property(u => u.SessionId).HasColumnName("session_id");
            e.Property(u => u.EventType).HasColumnName("event_type").HasMaxLength(50).IsRequired();
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
        });
    }
}
