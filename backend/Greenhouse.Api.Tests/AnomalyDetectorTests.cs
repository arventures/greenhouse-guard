using Greenhouse.Api.Models;
using Greenhouse.Api.Services;

namespace Greenhouse.Api.Tests;

public class AnomalyDetectorTests
{
    private readonly AnomalyDetector _detector = new();

    public AnomalyDetectorTests()
    {
        foreach (var temperature in Enumerable.Range(0, 20).Select(i => 22m + i % 2 * 0.4m))
        {
            _detector.Check(Reading(temperature));
        }
    }

    [Fact]
    public void AnomalyDetector_WithSpike_ReturnsAnomaly()
    {
        var anomalies = _detector.Check(Reading(35m));

        var anomaly = Assert.Single(anomalies);
        Assert.Equal("temperature", anomaly.SensorType);
        Assert.Equal(35m, anomaly.Value);
        Assert.True(anomaly.ZScore > 2.5m);
    }

    [Fact]
    public void AnomalyDetector_WithNormalReading_ReturnsNothing()
    {
        var anomalies = _detector.Check(Reading(22.3m));

        Assert.Empty(anomalies);
    }

    private static SensorReading Reading(decimal temperature) => new()
    {
        Temperature = temperature,
        Humidity = 60m,
        Co2Ppm = 650
    };
}
