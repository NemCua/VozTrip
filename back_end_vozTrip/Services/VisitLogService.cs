namespace back_end_vozTrip.Services;

public class VisitLogService(AppDbContext db)
{
    public async Task LogAsync(string sessionId, string poiId)
    {
        db.VisitLogs.Add(new Models.VisitLog
        {
            SessionId   = sessionId,
            PoiId       = poiId,
            TriggeredAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}
