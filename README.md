# Greenhouse Guard

A real-time greenhouse dashboard. An ASP.NET Core minimal API stores sensor readings in SQLite, flags anomalies, and pushes updates to an Angular dashboard over SignalR. The design, with diagrams and request examples, is in [docs/system-design.md](docs/system-design.md).

## Run everything

Requirements: Docker and make.

| Command | What it does |
|---|---|
| `make up` | Builds and starts the API on http://localhost:8080 and the dashboard on http://localhost:4200 |
| `make seed` | Posts 21 readings in one request. The last one is a temperature spike |
| `make reading` | Posts one reading. Change its values with `T`, `H` and `CO2`, for example `make reading T=40` |
| `make stop-api` | Stops only the API, so you can see the app offline |
| `make start-api` | Starts the API again |
| `make spec` | Saves the running API's OpenAPI document to `docs/openapi.json` |
| `make test` | Runs the backend and frontend tests |
| `make logs` | Follows the logs |
| `make down` | Stops everything |

For live readings, open http://localhost:4200/admin/mock-machine-reading in a second window and press **Start**.

## Run the backend on its own

Install the .NET 10 SDK, then run `dotnet run` in `backend/Greenhouse.Api`. The API listens on http://localhost:8080 and creates `greenhouse.db` in that folder. Run the tests with `dotnet test` in `backend`.

## Run the frontend on its own

Install Node.js 24 LTS, then run `npm install` and `npx ng serve` in `frontend`. The dashboard opens on http://localhost:4200 and expects the API on http://localhost:8080. Run the tests with `npx ng test`.

## Configuration

Environment variables override `appsettings.json`, with `__` between section names.

| Variable | Default | What it sets |
|---|---|---|
| `ConnectionStrings__Greenhouse` | `Data Source=greenhouse.db`, and `Data Source=/data/greenhouse.db` in Docker | The SQLite file |
| `Cors__Origin` | `http://localhost:4200` | The dashboard origin allowed to call the API |
| `Logging__Console__FormatterName` | `simple` | `json` writes one JSON object per log line |

The dashboard calls the API at `http://localhost:8080`, set in `frontend/src/app/api.ts`.

## Assumptions

- One greenhouse, and no authentication.
- The server sets `Id`, `SequenceNumber` and `Timestamp` (UTC). A bulk POST is saved in one transaction with one timestamp, and "latest" means the highest `SequenceNumber`.
- Valid readings: temperature from -50 to 100 °C, humidity from 0 to 100 %, and CO₂ from 0 to 10,000 ppm, sent as JSON numbers. If one reading in a bulk POST is invalid, nothing is saved.
- The requirements don't define the card colours. Green and yellow ranges are 18–28 and 15–32 °C, 50–75 and 40–85 %, and 400–1200 and 300–1500 ppm. Anything else is red. They're in `frontend/src/app/sensors.ts`.
- Anomalies and the detector's windows live in memory, so a restart clears them. Detection starts once a sensor has 20 values.
- The mock machine is a second page: an admin tool that stands in for a real sensor. The offline queue lives there, because readings come from the machine. It only keeps failures a retry can fix: no connection, or a server error.
- The chart needs the last 20 readings when the page opens, so the API has a fourth endpoint, `GET /api/readings/recent`.
- State lives in Angular signals rather than BehaviorSubjects. RxJS Subjects still carry the SignalR events.

## What I would improve with more time

- **Pagination:** readings arrive every few seconds, so a reading history would need cursor pagination, with a top-level `data` key in the response.
- **API structure:** minimal APIs suit four endpoints. A larger API could use controllers, which give each resource a class, with model validation and filters built in.
- **Offline queue:** an idempotency key, so a request that succeeded but lost its response can't be saved twice, and the time each reading was taken.
- **Anomalies:** persist them, and rebuild the detector's windows from the last 20 readings when the API starts.
- **Production:** Postgres or MySQL instead of SQLite, a background worker for slow work such as alerts, and the frontend and backend deployed separately.
- **Observability:** JSON logs in production, health checks, OpenTelemetry traces and metrics, and error tracking.
- **Tests and security:** API integration tests, an end-to-end test of the SignalR flow, and authentication for posting readings.
