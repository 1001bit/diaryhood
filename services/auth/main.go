package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/emailpb"
	"github.com/1001bit/pathgoer/services/auth/grpcclient"
	"github.com/1001bit/pathgoer/services/auth/otp"
	"github.com/1001bit/pathgoer/services/auth/server"
	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc"
)

func main() {
	// userclient
	conn, err := grpcclient.New(os.Getenv("USER_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	userclient := userpb.NewUserServiceClient(conn)
	log.Println("userclient connected on " + os.Getenv("USER_HOST") + ":" + os.Getenv("PORT"))

	// emailclient
	conn, err = grpcclient.New(os.Getenv("EMAIL_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	emailclient := emailpb.NewEmailServiceClient(conn)
	log.Println("emailclient connected on " + os.Getenv("EMAIL_HOST") + ":" + os.Getenv("PORT"))

	// otpStorage
	otpStorage := otp.NewStorage(os.Getenv("AUTH_REDIS_HOST"), os.Getenv("REDIS_PORT"))
	log.Println("otpStorage connected on " + os.Getenv("AUTH_REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"))

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	authpb.RegisterAuthServiceServer(grpcServer, server.New(userclient, emailclient, otpStorage))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
