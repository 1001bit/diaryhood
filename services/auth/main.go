package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/otp"
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
	log.Println("userclient connected on " + os.Getenv("USER_HOST") + ":" + os.Getenv("PORT"))

	// optStorage
	otpStorage := otp.NewStorage(os.Getenv("AUTH_REDIS_HOST"), os.Getenv("REDIS_PORT"))
	log.Println("otpStorage connected on " + os.Getenv("AUTH_REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"))

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	authpb.RegisterAuthServiceServer(grpcServer, server.New(userclient, otpStorage))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
