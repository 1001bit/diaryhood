package handler

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func (h *Handler) HandleHomePaths(w http.ResponseWriter, r *http.Request) {
	akserId := "0"
	if claims, ok := accesstoken.GetClaimsFromContext(r.Context()); ok {
		akserId = claims.Id
	}

	paths, err := h.pathstore.GetHomePaths(r.Context(), akserId)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		slog.With("err", err).Error("Failed to get paths")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	pathsJson, err := json.Marshal(paths)
	if err != nil {
		slog.With("err", err).Error("Failed to marshal paths")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(pathsJson)
}
