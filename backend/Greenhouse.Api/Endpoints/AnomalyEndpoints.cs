using Greenhouse.Api.Models;
using Greenhouse.Api.Services;

namespace Greenhouse.Api.Endpoints;

public static class AnomalyEndpoints
{
    public static void MapAnomalyEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/anomalies", GetRecent).WithTags("Anomalies");
    }

    private static List<Anomaly> GetRecent(AnomalyStore anomalies) => anomalies.GetRecent();
}
