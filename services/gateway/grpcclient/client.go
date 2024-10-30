package grpcclient

import (
	"fmt"
	"log/slog"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func New(host, port string) (*grpc.ClientConn, error) {
	addr := fmt.Sprintf("%s:%s", host, port)

	slog.With("addr", addr).Info("Connecting to gRPC server")

	// INSECURE
	return grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
}
