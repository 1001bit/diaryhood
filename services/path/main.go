package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/database"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(dbConnStr string) (*server.Server, func()) {
	// start database
	dbConn := database.NewConn(dbConnStr)
	go dbConn.Connect()
	// models
	pathstore := pathmodel.NewPathStore(dbConn)

	// user server
	return server.New(pathstore), func() {
		dbConn.Close()
	}
}

func main() {
	dbCfg := database.Config{
		User: os.Getenv("POSTGRES_USER"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: "path-postgres",
		Port: os.Getenv("POSTGRES_PORT"),
		Name: os.Getenv("POSTGRES_DB"),
	}

	server, close := initServer(dbCfg.String())
	defer close()

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	if err := server.Start(addr); err != nil {
		slog.With("err", err).Error("Error Listening")
	}

	slog.Info("Shutting down")
}
