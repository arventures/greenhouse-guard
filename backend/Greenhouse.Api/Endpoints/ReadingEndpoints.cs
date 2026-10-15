using System.Text.Json;
using Greenhouse.Api.Helpers;
using Greenhouse.Api.Models;
using Greenhouse.Api.OpenApi;
using Greenhouse.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Greenhouse.Api.Endpoints;

public static class ReadingEndpoints
{
    private const string InvalidBody =
        "Send one reading or an array of readings, each with temperature, humidity and co2Ppm.";

    public static void MapReadingEndpoints(this IEndpointRouteBuilder app)
    {
        var readings = app.MapGroup("/api/readings").WithTags("Readings");

        readings.MapGet("/latest", GetLatest).ProducesProblem(StatusCodes.Status404NotFound);
        readings.MapGet("/recent", GetRecent);
        readings.MapPost("", Create)
            .Produces(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .AddOpenApiOperationTransformer(OneOrManyReadings.DescribeAsync);
    }

    private static async Task<Results<Ok<SensorReading>, NotFound>> GetLatest(ReadingService service)
    {
        var latest = await service.GetLatestAsync();
        return latest is null ? TypedResults.NotFound() : TypedResults.Ok(latest);
    }

    private static Task<List<SensorReading>> GetRecent(ReadingService service) => service.GetRecentAsync();

    private static async Task<IResult> Create(JsonElement body, ReadingService service)
    {
        var newReadings = JsonBody.OneOrMany<NewReading>(body);
        if (newReadings is null)
        {
            return TypedResults.Problem(InvalidBody, statusCode: StatusCodes.Status400BadRequest);
        }

        var error = newReadings.Select(r => r.Validate()).FirstOrDefault(e => e is not null);
        if (error is not null)
        {
            return TypedResults.Problem(error, statusCode: StatusCodes.Status400BadRequest);
        }

        var saved = await service.AddAsync(newReadings);
        return body.ValueKind == JsonValueKind.Array
            ? TypedResults.Json(saved, statusCode: StatusCodes.Status201Created)
            : TypedResults.Json(saved[0], statusCode: StatusCodes.Status201Created);
    }
}
