package handler

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func (h *Handler) HandleDeleteStat(w http.ResponseWriter, r *http.Request) {
	userId := "0"
	if claims, ok := accesstoken.GetClaimsFromContext(r.Context()); !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		userId = claims.Id
	}

	pathId := r.PathValue("id")
	statName := r.PathValue("stat")

	if !idValid(r.PathValue("id")) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := h.pathstore.DeleteStat(r.Context(), pathId, statName, userId)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		slog.With("err", err).Error("Failed to delete stat")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
