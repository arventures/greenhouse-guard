# Greenhouse Guard

A real-time greenhouse dashboard. An ASP.NET Core minimal API stores sensor readings in SQLite, flags anomalies, and pushes updates to an Angular dashboard over SignalR. The design is in [docs/system-design.md](docs/system-design.md).

## Run

Requirements: Docker and make.

| Command | What it does |
|---|---|
| `make up` | Builds and starts the API on http://localhost:8080 and the dashboard on http://localhost:4200 |
| `make seed` | Posts 21 readings in one request. The last one is a temperature spike |
| `make reading` | Posts one reading. Change its values with `T`, `H` and `CO2`, for example `make reading T=40` |
| `make stop-api` | Stops only the API, so you can see the dashboard go offline |
| `make start-api` | Starts the API again |
| `make spec` | Saves the running API's OpenAPI document to `docs/openapi.json` |
| `make test` | Runs the backend and frontend tests |
| `make logs` | Follows the logs |
| `make down` | Stops everything |

Without Docker, run `dotnet run` in `backend/Greenhouse.Api` with the .NET 10 SDK, and `npm install`, then `npx ng serve`, in `frontend` with Node.js 24 LTS.

## API

| Endpoint | What it does |
|---|---|
| `GET /api/readings/latest` | Returns the newest reading, or 404 before the first one |
| `POST /api/readings` | Saves one reading, or an array of readings in one transaction, and returns 201 with what was saved |
| `GET /api/anomalies` | Returns the last 20 anomalies, oldest first |

Errors are ProblemDetails JSON, and `GET /openapi/v1.json` describes every endpoint. An anomaly is a value more than 2.5 standard deviations from the mean of its sensor's last 20 values. Anomalies stay in memory, as the requirements ask. The SignalR hub at `/hubs/sensors` sends `ReceiveReading` and `ReceiveAnomaly` to every client, and clients can call its `Heartbeat` method.

## Dashboard

http://localhost:4200 shows:
- LIVE or OFFLINE, and "Ping": the round trip of a heartbeat the page sends every 15 seconds.
- How long ago the last reading arrived. Hover over it for the exact time.
- Three cards coloured green, yellow or red, whose values animate when they change.
- The last 10 anomalies, and a pop-up for each new one.

Hover over a label, or tap it on a phone, to see what it means.

## Database

SQLite, through EF Core. When the API starts, its migrations create `data/greenhouse.db`. To look inside:

```bash
sqlite3 -readonly data/greenhouse.db "SELECT * FROM SensorReadings ORDER BY SequenceNumber DESC LIMIT 5"
```
