using System.Text.Json.Serialization;
using Greenhouse.Api.Data;
using Greenhouse.Api.Endpoints;
using Greenhouse.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
builder.Services.AddProblemDetails();
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = false);
builder.Services.AddOpenApi();
builder.Services.AddDbContext<GreenhouseDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Greenhouse")));
builder.Services.AddScoped<ReadingService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GreenhouseDbContext>();
    db.Database.Migrate();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapReadingEndpoints();
app.MapOpenApi();

app.Run();
