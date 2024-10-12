package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/server"
	"github.com/1001bit/pathgoer/services/auth/userclient"
	"google.golang.org/grpc"
)

func main() {
	// userclient
	userclient, err := userclient.New(os.Getenv("USER_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	authpb.RegisterAuthServiceServer(grpcServer, server.New(userclient))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
