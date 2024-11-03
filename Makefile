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
PATH_PATH = services/path

# Build and start
all: build up

# Build the Docker containers
build:
	@echo "\nBuilding Docker containers..."
	$(DOCKER_COMPOSE) build

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

# Generate go from templ files
templ:
	@echo "\nGenerating go from templ files..."
	$(TEMPL) generate /services/gateway/go.mod

# Generate golang protoc
protoc:
	@echo "\nGenerating user protoc..."
	$(PROTOC) \
	--go_out=$(GATEWAY_PATH)/shared --go-grpc_out=$(GATEWAY_PATH)/shared \
    --go_out=$(USER_PATH)/shared --go-grpc_out=$(USER_PATH)/shared \
    protobuf/user.proto

	@echo "\nGenerating path protoc..."
	$(PROTOC) \
	--go_out=$(GATEWAY_PATH)/shared --go-grpc_out=$(GATEWAY_PATH)/shared \
    --go_out=$(PATH_PATH)/shared --go-grpc_out=$(PATH_PATH)/shared \
    protobuf/path.proto

# Compile typescript files
tscompile:
	@echo "\nCompiling typescript files..."
	$(TSCOMPILER) $(TS_PATH)

# Copy shared files to their destinations
copyshared:
	@echo "\nCopying shared go files..."
	$(SHARED) $(SHARED_PATH)

# Tests
test user:
	cd services/user/ ; go test -v ./... ; cd -

test path:
	cd services/path/ ; go test -v ./... ; cd -