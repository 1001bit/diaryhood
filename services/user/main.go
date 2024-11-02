package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/shared/postgresclient"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitclient"
	"github.com/1001bit/pathgoer/services/user/shared/redisclient"
	"github.com/1001bit/pathgoer/services/user/usermodel"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(postgresConnStr, rabbitConnStr, refreshConnStr, otpConnStr string) (*server.Server, func()) {
	// start database
	postgresC := postgresclient.New(postgresConnStr)
	go postgresC.Connect()
	// models
	userstore := usermodel.NewUserStore(postgresC)

	// RabbitMQ connection
	rabbitC := rabbitclient.New(rabbitConnStr)
	go rabbitC.Connect()

	// refresh storage
	refreshStorage := refreshstorage.New(refreshConnStr)
	// otpStorage
	otpStorage := otpstorage.New(otpConnStr)

	// user server
	return server.New(userstore, otpStorage, refreshStorage, rabbitC), func() {
		postgresC.Close()
		rabbitC.Close()
	}
}

func main() {
	postgresCfg := postgresclient.Config{
		User: os.Getenv("POSTGRES_USER"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "user-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
		Name: os.Getenv("POSTGRES_DB"),
	}

	rabbitCfg := rabbitclient.Config{
		User: os.Getenv("RABBITMQ_USER"),
		Pass: os.Getenv("RABBITMQ_PASS"),
		Host: "email-rabbitmq",
		Port: os.Getenv("RABBITMQ_PORT"),
	}

	refreshRedisCfg := redisclient.Config{
		Host: "refresh-redis",
		Port: os.Getenv("REDIS_PORT"),
		Pass: "",
		Db:   0,
	}

	otpRedisCfg := redisclient.Config{
		Host: "otp-redis",
		Port: os.Getenv("REDIS_PORT"),
		Pass: "",
		Db:   0,
	}

	userServer, close := initServer(postgresCfg.String(), rabbitCfg.String(), refreshRedisCfg.String(), otpRedisCfg.String())
	defer close()

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	if err := userServer.Start(addr); err != nil {
		slog.With("err", err).Error("Failed to run server")
	}
	slog.Info("Shutting down")
}
