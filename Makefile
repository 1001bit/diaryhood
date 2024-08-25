# Makefile for Online Canvas Games

# Variables
DOCKER_COMPOSE = docker compose

# Do all
all: build up

# Build the Docker containers
build:
	@echo "Building Docker containers..."
	$(DOCKER_COMPOSE) build

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

.PHONY: all build up down clean