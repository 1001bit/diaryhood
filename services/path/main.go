package main

import (
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(dbConnStr string) (*server.Server, func()) {
	// start database
	postgresC := postgresclient.New(dbConnStr)
	go postgresC.Connect()

	pathstore := pathmodel.NewPathStore(postgresC)

	return server.New(pathstore), func() {
		postgresC.Close()
	}
}

func main() {
	dbCfg := postgresclient.Config{
		User: os.Getenv("POSTGRES_USER"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "path-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
		Name: os.Getenv("POSTGRES_DB"),
	}

	server, close := initServer(dbCfg.String())
	defer close()

	if err := server.ListenAndServe(os.Getenv("PORT")); err != nil {
		slog.With("err", err).Error("Error Listening")
	}

	slog.Info("Shutting down")
}
