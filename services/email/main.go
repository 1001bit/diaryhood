package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/email/emailpb"
	"github.com/1001bit/pathgoer/services/email/server"
	"google.golang.org/grpc"
)

func main() {
	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	emailpb.RegisterEmailServiceServer(grpcServer, server.New())

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
