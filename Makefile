# Ogify Makefile
.PHONY: dev start build install db-setup db-migrate db-seed docker-up docker-down deploy-fly

# Development
dev:
	@echo "Starting development server..."
	bun run dev

start:
	bun run start

install:
	bun install
	cd frontend && npm install

# Database
db-setup: db-migrate db-seed

db-migrate:
	bunx prisma db push

db-generate:
	bunx prisma generate

db-seed:
	bun run prisma/seed.ts

db-studio:
	bunx prisma studio

# Build
build:
	bun run build
	cd frontend && npm run build

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker build -t ogify .

docker-logs:
	docker-compose logs -f

# Fly.io deployment
deploy-fly:
	fly deploy

fly-secrets:
	@echo "Set secrets with: fly secrets set DATABASE_URL=xxx REDIS_URL=xxx JWT_SECRET=xxx"

# Testing
test:
	bun test

# Linting
lint:
	cd frontend && npm run lint

# Clean
clean:
	rm -rf node_modules dist
	cd frontend && rm -rf node_modules dist

# Help
help:
	@echo "Available commands:"
	@echo "  make dev         - Start development server"
	@echo "  make install     - Install dependencies"
	@echo "  make db-setup    - Setup database (migrate + seed)"
	@echo "  make build       - Build for production"
	@echo "  make docker-up   - Start Docker containers"
	@echo "  make deploy-fly  - Deploy to Fly.io"
