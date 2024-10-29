# Makefile for Online Canvas Games

# Variables
DOCKER_COMPOSE = docker compose
TEMPL = templ
PROTOC = protoc
TSCOMPILER = python3 ./typescript/tscompiler.py
SHARED = python3 ./shared/shared.py

TS_PATH = typescript
SHARED_PATH = shared
GATEWAY_PATH = services/gateway
USER_PATH = services/user

# Build and start
all: build up

# Build the Docker containers
build:
	@echo "\nBuilding Docker containers..."
	$(DOCKER_COMPOSE) build

# Generate go from templ files
templ:
	@echo "\nGenerating go from templ files..."
	$(TEMPL) generate /services/gateway/go.mod

# Generate golang protoc
protoc:
	@echo "\nGenerating user protoc..."
	$(PROTOC) \
	--go_out=$(GATEWAY_PATH) --go-grpc_out=$(GATEWAY_PATH) \
    --go_out=$(USER_PATH) --go-grpc_out=$(USER_PATH) \
    protobuf/user.proto

# Compile typescript files
tscompile:
	@echo "\nCompiling typescript files..."
	$(TSCOMPILER) $(TS_PATH)

# Copy shared files to their destinations
copyshared:
	@echo "\nCopying shared go files..."
	$(SHARED) $(SHARED_PATH)

# Start the Docker containers
up:
	@echo "\nStarting Docker containers..."
	$(DOCKER_COMPOSE) up

# Stop the Docker containers
down:
	@echo "\nStopping Docker containers..."
	$(DOCKER_COMPOSE) down

# Clean up Docker resources
clean:
	@echo "\nCleaning up Docker resources..."
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans