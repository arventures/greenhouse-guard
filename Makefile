.PHONY: up down logs stop-api start-api seed reading spec test

API ?= http://localhost:8080
T ?= 22.5
H ?= 61.5
CO2 ?= 650

up:
	docker compose up --build --wait

down:
	docker compose down

logs:
	docker compose logs -f

stop-api:
	docker compose stop api

start-api:
	docker compose start api

seed:
	@curl -s -o /dev/null -w "POST /api/readings -> %{http_code}\n" \
		-H "Content-Type: application/json" --data @seed/readings.json $(API)/api/readings

reading:
	@curl -s -w "\n" -H "Content-Type: application/json" \
		-d '{"temperature": $(T), "humidity": $(H), "co2Ppm": $(CO2)}' $(API)/api/readings

spec:
	@curl -sSf $(API)/openapi/v1.json -o docs/openapi.json
	@echo "Saved docs/openapi.json"

test:
	docker run --rm -v "$(CURDIR)/backend:/src:ro" mcr.microsoft.com/dotnet/sdk:10.0 \
		sh -c "cp -r /src /work && cd /work && dotnet test"
	docker compose run --rm --no-deps --build web npx ng test --watch=false
