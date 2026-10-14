# Greenhouse Guard

A real-time greenhouse dashboard. An ASP.NET Core minimal API stores sensor readings in SQLite, flags anomalies, and pushes updates to an Angular dashboard over SignalR. The design is in [docs/system-design.md](docs/system-design.md).

## Run

Requirements: Docker and make.

| Command | What it does |
|---|---|
| `make up` | Builds and starts the API on http://localhost:8080 |
| `make logs` | Follows the logs |
| `make down` | Stops everything |

Without Docker, run `dotnet run` in `backend/Greenhouse.Api` with the .NET 10 SDK.

## Database

SQLite, through EF Core. When the API starts, its migrations create `data/greenhouse.db`. To look inside:

```bash
sqlite3 -readonly data/greenhouse.db ".schema SensorReadings"
```
