package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/user/database"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc"
)

func main() {
	// start database
	db, err := database.NewFromEnv()
	if err != nil {
		log.Fatal("err starting database:", err)
	}
	defer db.Close()

	// models
	userstore := usermodel.NewUserStore(db)

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, server.New(userstore))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
