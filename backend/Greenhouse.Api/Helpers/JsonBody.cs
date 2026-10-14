using System.Text.Json;
using System.Text.Json.Serialization;

namespace Greenhouse.Api.Helpers;

public static class JsonBody
{
    private static readonly JsonSerializerOptions Options =
        new(JsonSerializerDefaults.Web) { NumberHandling = JsonNumberHandling.Strict };

    public static List<T>? OneOrMany<T>(JsonElement body)
    {
        List<JsonElement> items = body.ValueKind == JsonValueKind.Array ? [.. body.EnumerateArray()] : [body];
        if (items.Count == 0 || items.Any(item => item.ValueKind != JsonValueKind.Object))
        {
            return null;
        }

        try
        {
            return [.. items.Select(item => item.Deserialize<T>(Options)!)];
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
