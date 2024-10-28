package grpcclient

import (
	"fmt"
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func New(host, port string) (*grpc.ClientConn, error) {
	addr := fmt.Sprintf("%s:%s", host, port)
	log.Println("Connecting to grpc server on", addr)

	// INSECURE
	return grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
}
