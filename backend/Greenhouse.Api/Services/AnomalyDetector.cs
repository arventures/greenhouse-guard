using Greenhouse.Api.Models;

namespace Greenhouse.Api.Services;

public class AnomalyDetector
{
    private const int WindowSize = 20;
    private const double Threshold = 2.5;

    private readonly Dictionary<string, Queue<double>> _windows = [];
    private readonly Lock _lock = new();

    public List<Anomaly> Check(SensorReading reading)
    {
        (string Sensor, decimal Value)[] values =
        [
            ("temperature", reading.Temperature),
            ("humidity", reading.Humidity),
            ("co2", reading.Co2Ppm)
        ];

        lock (_lock)
        {
            return [.. values.Select(v => CheckValue(v.Sensor, v.Value)).OfType<Anomaly>()];
        }
    }

    private Anomaly? CheckValue(string sensor, decimal value)
    {
        if (!_windows.TryGetValue(sensor, out var window))
        {
            window = new Queue<double>();
            _windows[sensor] = window;
        }

        var anomaly = window.Count == WindowSize ? Detect(sensor, value, window) : null;

        window.Enqueue((double)value);
        if (window.Count > WindowSize)
        {
            window.Dequeue();
        }

        return anomaly;
    }

    private static Anomaly? Detect(string sensor, decimal value, Queue<double> window)
    {
        var mean = window.Average();
        var stdDev = Math.Sqrt(window.Average(v => (v - mean) * (v - mean)));
        if (stdDev == 0)
        {
            return null;
        }

        var zScore = ((double)value - mean) / stdDev;
        if (Math.Abs(zScore) <= Threshold)
        {
            return null;
        }

        var direction = zScore > 0 ? "above" : "below";
        return new Anomaly
        {
            Id = Guid.NewGuid(),
            DetectedAt = DateTime.UtcNow,
            SensorType = sensor,
            Value = value,
            ZScore = Math.Round((decimal)zScore, 2),
            Reason = $"{value} is {Math.Abs(zScore):F1} standard deviations {direction} the mean of the last {window.Count} readings ({mean:F2})."
        };
    }
}
