package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/router"
	"github.com/1001bit/pathgoer/services/gateway/storageclient"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	// userclient
	userclient, err := userclient.New("user", os.Getenv("PORT"))
	if err != nil {
		slog.With("err", err).Error("Failed to connect to user service")
		return
	}
	defer userclient.Close()
	slog.With("addr", userclient.Target()).Info("Connected to user service")

	// storageclient
	storageclient, err := storageclient.New("storage", os.Getenv("STORAGE_PORT"))
	if err != nil {
		slog.With("err", err).
			With("host", "storage").
			With("port", os.Getenv("STORAGE_PORT")).
			Error("Failed to connect to storage service")
		return
	}
	slog.Info("Connected to storage service")

	// http server
	r := router.New(userclient, storageclient)
	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))

	slog.With("addr", addr).Info("Listening")
	if err := http.ListenAndServe(addr, r); err != nil {
		slog.With("err", err).Error("Error Listening")
	}
	slog.Info("Shutting down")
}
