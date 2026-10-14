using Greenhouse.Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace Greenhouse.Api.Hubs;

public interface ISensorClient
{
    Task ReceiveReading(SensorReading reading);
    Task ReceiveAnomaly(Anomaly anomaly);
}

public class SensorHub(ILogger<SensorHub> logger) : Hub<ISensorClient>
{
    public void Heartbeat() => logger.LogDebug("Heartbeat from {ConnectionId}", Context.ConnectionId);
}
