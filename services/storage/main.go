package main

import (
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/storage/server"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	server := server.New()
	if err := server.ListenAndServe(os.Getenv("PORT")); err != nil {
		slog.With("err", err).Error("Error Listening")
	}
	slog.Info("Shutting down")
}
