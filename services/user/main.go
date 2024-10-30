package main

import (
	"fmt"
	"log/slog"
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

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

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
		slog.With("err", err).Error("Failed to connect to database")
		return
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
		slog.With("err", err).With("port", os.Getenv("PORT")).Error("Failed to listen to TCP")
		return
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, server.New(userstore, otpStorage, refreshStorage, amqpConn))

	// start grpc server
	slog.With("addr", lis.Addr()).Info("Starting gRPC server")
	if err := grpcServer.Serve(lis); err != nil {
		slog.With("err", err).Error("Failed to start gRPC server")
	}
	slog.Info("Shutting down")
}
