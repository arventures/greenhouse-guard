using Greenhouse.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<GreenhouseDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Greenhouse")));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GreenhouseDbContext>();
    db.Database.Migrate();
}

app.Run();
