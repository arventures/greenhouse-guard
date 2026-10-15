using Greenhouse.Api.Data;
using Greenhouse.Api.Hubs;
using Greenhouse.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Greenhouse.Api.Services;

public class ReadingService(
    GreenhouseDbContext db,
    AnomalyDetector detector,
    AnomalyStore anomalies,
    IHubContext<SensorHub, ISensorClient> hub)
{
    private const int RecentCount = 20;

    public Task<SensorReading?> GetLatestAsync() =>
        db.SensorReadings.OrderByDescending(r => r.SequenceNumber).FirstOrDefaultAsync();

    public Task<List<SensorReading>> GetRecentAsync() =>
        db.SensorReadings
            .OrderByDescending(r => r.SequenceNumber)
            .Take(RecentCount)
            .OrderBy(r => r.SequenceNumber)
            .ToListAsync();

    public async Task<List<SensorReading>> AddAsync(List<NewReading> newReadings)
    {
        var timestamp = DateTime.UtcNow;
        var readings = newReadings.Select(r => r.ToSensorReading(timestamp)).ToList();

        db.SensorReadings.AddRange(readings);
        await db.SaveChangesAsync();

        foreach (var reading in readings)
        {
            await hub.Clients.All.ReceiveReading(reading);

            foreach (var anomaly in detector.Check(reading))
            {
                anomalies.Add(anomaly);
                await hub.Clients.All.ReceiveAnomaly(anomaly);
            }
        }

        return readings;
    }
}
