package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/httpproxy"
	"github.com/1001bit/pathgoer/services/gateway/server"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func initServer(userAddr, storageAddr, pathAddr string) (*server.Server, func()) {
	// userclient
	userclient, err := userclient.New(userAddr)
	if err != nil {
		slog.With("err", err).Error("Failed to connect to user service")
	}

	// storageproxy
	storageproxy, err := httpproxy.New(storageAddr)
	if err != nil {
		slog.With("err", err).
			With("addr", storageAddr).
			Error("Failed to to parse url")
	}

	// pathproxy
	pathproxy, err := httpproxy.New(pathAddr)
	if err != nil {
		slog.With("err", err).
			With("addr", pathAddr).
			Error("Failed to to parse url")
	}

	return server.New(userclient, storageproxy, pathproxy), func() {
		userclient.Close()
	}
}

func main() {
	userAddr := fmt.Sprintf("%s:%s", "user", os.Getenv("PORT"))
	storageAddr := fmt.Sprintf("http://%s:%s", "storage", os.Getenv("PORT"))
	pathAddr := fmt.Sprintf("http://%s:%s", "path", os.Getenv("PORT"))

	server, close := initServer(userAddr, storageAddr, pathAddr)
	defer close()

	if err := server.ListenAndServe(os.Getenv("PORT")); err != nil {
		slog.With("err", err).Error("Error Listening")
	}
	slog.Info("Shutting down")
}
