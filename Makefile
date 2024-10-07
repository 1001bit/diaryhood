# Makefile for Online Canvas Games

# Variables
DOCKER_COMPOSE = docker compose
TEMPL = templ
PROTOC = protoc
TSCOMPILER = ./tscompiler

TS_PATH = typescript

# Do all
all: templ tscompile build up

# Build the Docker containers
build:
	@echo "Building Docker containers..."
	$(DOCKER_COMPOSE) build

# Generate go from templ files
templ:
	@echo "Generating go from templ files..."
	$(TEMPL) generate /services/gateway/go.mod

# Generate golang protoc
protoc:
	@echo "Generating user protoc..."
	$(PROTOC) \
	--go_out=services/user --go_out=services/gateway \
	--go_opt=paths=source_relative \
    --go-grpc_out=services/user --go-grpc_out=services/gateway \
	--go-grpc_opt=paths=source_relative \
    userpb/user.proto

# Compile typescript files
tscompile:
	@echo "Compiling typescript files..."
	$(TSCOMPILER) $(TS_PATH)

# Start the Docker containers
up:
	@echo "Starting Docker containers..."
	$(DOCKER_COMPOSE) up

# Stop the Docker containers
down:
	@echo "Stopping Docker containers..."
	$(DOCKER_COMPOSE) down

# Clean up Docker resources
clean:
	@echo "Cleaning up Docker resources..."
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans