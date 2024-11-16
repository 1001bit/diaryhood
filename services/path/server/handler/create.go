package handler

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/server/middleware"
)

func HandleCreatePath(w http.ResponseWriter, r *http.Request) {
	username, ok := middleware.GetUsernameFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	id := 123
	slog.With("username", username).Info("Creating path")

	fmt.Fprintf(w, `{"id": %d}`, id)
}
