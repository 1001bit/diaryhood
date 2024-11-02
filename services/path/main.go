package main

import (
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/path/shared/database"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	dbCfg := database.Config{
		User: os.Getenv("POSTGRES_USER"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "path-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
		Name: os.Getenv("POSTGRES_DB"),
	}

	dbConn := database.NewConn(dbCfg.String())
	go dbConn.Connect()
	defer dbConn.Close()

	<-make(chan struct{})
	slog.Info("Shutting down")
}
