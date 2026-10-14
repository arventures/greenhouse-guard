namespace Greenhouse.Api.Models;

public class NewReading
{
    public required decimal Temperature { get; init; }
    public required decimal Humidity { get; init; }
    public required int Co2Ppm { get; init; }

    public string? Validate() => this switch
    {
        { Temperature: < -50 or > 100 } => "Temperature must be between -50 and 100 °C.",
        { Humidity: < 0 or > 100 } => "Humidity must be between 0 and 100 %.",
        { Co2Ppm: < 0 or > 10000 } => "CO2 must be between 0 and 10000 ppm.",
        _ => null
    };

    public SensorReading ToSensorReading(DateTime timestamp) => new()
    {
        Id = Guid.NewGuid(),
        Timestamp = timestamp,
        Temperature = Temperature,
        Humidity = Humidity,
        Co2Ppm = Co2Ppm
    };
}
