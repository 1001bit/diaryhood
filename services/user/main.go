package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/user/amqpconn"
	"github.com/1001bit/pathgoer/services/user/database"
	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/redisclient"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/usermodel"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(dbConnStr, amqpConnStr, refreshConnStr, otpConnStr string) (*server.Server, func()) {
	// start database
	dbConn := database.NewConn(dbConnStr)
	go dbConn.Connect()
	// models
	userstore := usermodel.NewUserStore(dbConn)

	// RabbitMQ connection
	amqpConn := amqpconn.New(amqpConnStr)
	go amqpConn.Connect()

	// refresh storage
	refreshStorage := refreshstorage.New(refreshConnStr)
	// otpStorage
	otpStorage := otpstorage.New(otpConnStr)

	// user server
	return server.New(userstore, otpStorage, refreshStorage, amqpConn), dbConn.Close
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

	userServer, close := initServer(dbCfg.String(), amqpCfg.String(), refreshCfg.String(), otpCfg.String())
	defer close()

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	if err := userServer.Start(addr); err != nil {
		slog.With("err", err).Error("Failed to run server")
	}
	slog.Info("Shutting down")
}
