using System.Threading.Channels;
using back_end_vozTrip.Models;
using Microsoft.EntityFrameworkCore;

namespace back_end_vozTrip.Services;

/// <summary>
/// In-memory queue for visit log writes.
/// HTTP endpoint enqueues instantly (non-blocking).
/// Background worker drains the queue in batches → single DB round-trip per batch.
/// </summary>
public sealed class VisitLogQueue
{
    // Bounded: if queue is full, new items are dropped rather than blocking the caller
    private readonly Channel<VisitLog> _channel =
        Channel.CreateBounded<VisitLog>(new BoundedChannelOptions(10_000)
        {
            FullMode        = BoundedChannelFullMode.DropOldest,
            SingleReader    = true,
            SingleWriter    = false,
        });

    public bool TryEnqueue(VisitLog log) =>
        _channel.Writer.TryWrite(log);

    public ChannelReader<VisitLog> Reader => _channel.Reader;
}

/// <summary>
/// Hosted background service that drains VisitLogQueue and bulk-inserts into DB.
/// Writes every FLUSH_INTERVAL or when BATCH_SIZE is reached, whichever comes first.
/// </summary>
public sealed class VisitLogWorker(
    VisitLogQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<VisitLogWorker> logger) : BackgroundService
{
    private const int  BATCH_SIZE     = 50;
    private static readonly TimeSpan FLUSH_INTERVAL = TimeSpan.FromSeconds(2);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var batch = new List<VisitLog>(BATCH_SIZE);

        while (!ct.IsCancellationRequested)
        {
            // Wait up to FLUSH_INTERVAL for the first item
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(FLUSH_INTERVAL);

                await queue.Reader.WaitToReadAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                // Timeout — flush whatever is in the batch
            }

            // Drain up to BATCH_SIZE without blocking
            while (batch.Count < BATCH_SIZE && queue.Reader.TryRead(out var log))
                batch.Add(log);

            if (batch.Count == 0) continue;

            await FlushAsync(batch, ct);
            batch.Clear();
        }
    }

    private async Task FlushAsync(List<VisitLog> batch, CancellationToken ct)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.VisitLogs.AddRangeAsync(batch, ct);
            await db.SaveChangesAsync(ct);
            logger.LogDebug("VisitLogWorker: flushed {Count} records", batch.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "VisitLogWorker: failed to flush {Count} records", batch.Count);
        }
    }
}
