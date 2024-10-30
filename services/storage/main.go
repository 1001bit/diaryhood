package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/storage/router"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	r := router.New()

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))

	slog.With("addr", addr).Info("Listening")
	if err := http.ListenAndServe(addr, r); err != nil {
		slog.With("err", err).Error("Error Listening")
	}
	slog.Info("Shutting down")
}
