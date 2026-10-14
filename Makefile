.PHONY: up down logs

up:
	docker compose up --build --wait

down:
	docker compose down

logs:
	docker compose logs -f
