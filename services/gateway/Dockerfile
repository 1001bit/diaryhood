FROM golang:1.22.5 AS builder

WORKDIR /app

# dependencies
COPY go.* .
RUN go mod download
# other files
COPY . .

# compiling go -> ./main
RUN go build -o main main.go

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/main ./main