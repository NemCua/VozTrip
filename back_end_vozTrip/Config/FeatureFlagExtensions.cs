using Microsoft.AspNetCore.Http.HttpResults;

namespace back_end_vozTrip.Config;

public static class FeatureFlagExtensions
{
    private static readonly IResult Disabled =
        Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

    /// <summary>
    /// Gắn feature flag vào một endpoint.
    /// Nếu isEnabled(features) = false → trả về 404 trước khi handler chạy.
    /// </summary>
    public static RouteHandlerBuilder WithFeatureFlag(
        this RouteHandlerBuilder builder,
        Func<FeaturesConfig, bool> isEnabled)
    {
        return builder.AddEndpointFilter(async (ctx, next) =>
        {
            var features = ctx.HttpContext.RequestServices
                              .GetRequiredService<FeaturesConfig>();
            return !isEnabled(features) ? Disabled : await next(ctx);
        });
    }
}
