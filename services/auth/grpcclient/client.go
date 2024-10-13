package grpcclient

import (
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func New(host, port string) (*grpc.ClientConn, error) {
	addr := fmt.Sprintf("%s:%s", host, port)

	return grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
}
