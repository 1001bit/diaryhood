package handler

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func (h *Handler) HandleDeletePath(w http.ResponseWriter, r *http.Request) {
	askerId := "0"
	if claims, ok := accesstoken.GetClaimsFromContext(r.Context()); ok {
		askerId = claims.Id
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err := h.pathstore.DeletePath(r.Context(), r.PathValue("id"), askerId)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		slog.With("err", err).Error("Failed to delete path")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
