# Makefile for Online Canvas Games

# Variables
DOCKER_COMPOSE = docker compose
TEMPL = templ
PROTOC = protoc
TSCOMPILER = ./tscompiler

TS_PATH = typescript

AUTH_PATH = services/auth
GATEWAY_PATH = services/gateway
USER_PATH = services/user

# Do all
all: templ tscompile build up

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
	--go_out=$(AUTH_PATH) --go-grpc_out=$(AUTH_PATH) \
    protobuf/user.proto

	@echo "\nGenerating auth protoc..."
	$(PROTOC) \
	--go_out=$(GATEWAY_PATH) --go-grpc_out=$(GATEWAY_PATH) \
    --go_out=$(AUTH_PATH) --go-grpc_out=$(AUTH_PATH) \
    protobuf/auth.proto

# Compile typescript files
tscompile:
	@echo "\nCompiling typescript files..."
	$(TSCOMPILER) $(TS_PATH)

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