package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/user/amqpconn"
	"github.com/1001bit/pathgoer/services/user/database"
	"github.com/1001bit/pathgoer/services/user/otp"
	"github.com/1001bit/pathgoer/services/user/refresh"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc"
)

func main() {
	// start database
	db, err := database.NewFromEnv(database.Config{
		User: os.Getenv("POSTGRES_USER"),
		Name: os.Getenv("POSTGRES_DB"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "user-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
	})
	if err != nil {
		log.Fatal("err starting database:", err)
	}
	defer db.Close()

	// models
	userstore := usermodel.NewUserStore(db)

	// RabbitMQ connection
	amqpConn := amqpconn.New(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	amqpConn.Connect()

	// otpStorage
	otpStorage := otp.NewStorage("otp-redis", os.Getenv("REDIS_PORT"))

	// refresh storage
	refreshStorage := refresh.NewStorage("refresh-redis", os.Getenv("REDIS_PORT"))

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, server.New(userstore, otpStorage, refreshStorage, amqpConn))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
