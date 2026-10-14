using System.Text.Json;
using Greenhouse.Api.Models;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Greenhouse.Api.OpenApi;

public static class OneOrManyReadings
{
    public static async Task DescribeAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var newReading = await Reference(typeof(NewReading), context, cancellationToken);
        var reading = await Reference(typeof(SensorReading), context, cancellationToken);
        context.Document!.Components!.Schemas!.Remove(nameof(JsonElement));

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new() { Schema = OneOrMany(newReading) }
            }
        };
        operation.Responses!["201"] = new OpenApiResponse
        {
            Description = "Created",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new() { Schema = OneOrMany(reading) }
            }
        };
    }

    private static async Task<IOpenApiSchema> Reference(
        Type type,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var schema = await context.GetOrCreateSchemaAsync(type, null, cancellationToken);
        context.Document!.AddComponent(type.Name, schema);
        return new OpenApiSchemaReference(type.Name, context.Document);
    }

    private static OpenApiSchema OneOrMany(IOpenApiSchema item) => new()
    {
        OneOf = [item, new OpenApiSchema { Type = JsonSchemaType.Array, Items = item }]
    };
}
