package handler

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func (h *Handler) HandleUserPaths(w http.ResponseWriter, r *http.Request) {
	claims, ok := accesstoken.GetClaimsFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	userId := r.PathValue("id")

	paths, err := h.pathstore.GetPaths(r.Context(), claims.Id, userId)
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
