package main

import (
	"fmt"
	"log/slog"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/user/amqpconn"
	"github.com/1001bit/pathgoer/services/user/database"
	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/redisclient"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(dbCfg database.Config, amqpCfg amqpconn.Config, refreshCfg, otpCfg redisclient.Config) (*server.Server, func()) {
	// start database
	dbConn := database.NewConn(dbCfg)
	go dbConn.Connect()
	// models
	userstore := usermodel.NewUserStore(dbConn)

	// RabbitMQ connection
	amqpConn := amqpconn.New(amqpCfg)
	go amqpConn.Connect()

	// otpStorage
	otpStorage := otpstorage.New(otpCfg)
	// refresh storage
	refreshStorage := refreshstorage.New(refreshCfg)

	// user server
	return server.New(userstore, otpStorage, refreshStorage, amqpConn), dbConn.Close
}

func startServer(server *server.Server) {
	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		slog.With("err", err).With("port", os.Getenv("PORT")).Error("Failed to listen to TCP")
		return
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, server)

	// start grpc server
	slog.With("addr", lis.Addr()).Info("Starting gRPC server")
	if err := grpcServer.Serve(lis); err != nil {
		slog.With("err", err).Error("Failed to start gRPC server")
	}
}

func main() {
	dbCfg := database.Config{
		User: os.Getenv("POSTGRES_USER"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "user-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
		Name: os.Getenv("POSTGRES_DB"),
	}

	amqpCfg := amqpconn.Config{
		User: os.Getenv("RABBITMQ_USER"),
		Pass: os.Getenv("RABBITMQ_PASS"),
		Host: "email-rabbitmq",
		Port: os.Getenv("RABBITMQ_PORT"),
	}

	refreshCfg := redisclient.Config{
		Host: "refresh-redis",
		Port: os.Getenv("REDIS_PORT"),
		Pass: "",
		Db:   0,
	}

	otpCfg := redisclient.Config{
		Host: "otp-redis",
		Port: os.Getenv("REDIS_PORT"),
		Pass: "",
		Db:   0,
	}

	userServer, close := initServer(dbCfg, amqpCfg, refreshCfg, otpCfg)
	defer close()

	startServer(userServer)
	slog.Info("Shutting down")
}
