using Greenhouse.Api.Models;

namespace Greenhouse.Api.Services;

public class AnomalyStore
{
    private const int MaxCount = 20;

    private readonly Queue<Anomaly> _anomalies = new();
    private readonly Lock _lock = new();

    public void Add(Anomaly anomaly)
    {
        lock (_lock)
        {
            _anomalies.Enqueue(anomaly);
            if (_anomalies.Count > MaxCount)
            {
                _anomalies.Dequeue();
            }
        }
    }

    public List<Anomaly> GetRecent()
    {
        lock (_lock)
        {
            return [.. _anomalies];
        }
    }
}
