package handler

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
	"github.com/lib/pq"
)

func (h *Handler) HandleUpdateStat(w http.ResponseWriter, r *http.Request) {
	userId := "0"
	if claims, ok := accesstoken.GetClaimsFromContext(r.Context()); !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		userId = claims.Id
	}

	pathId := r.PathValue("id")
	statName := r.PathValue("stat")

	req := &pathmodel.Stat{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if !nameValid(req.Name) || !idValid(r.PathValue("id")) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = h.pathstore.UpdateStat(r.Context(), pathId, statName, req, userId)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err, ok := err.(*pq.Error); ok && err.Code == "23505" {
		w.WriteHeader(http.StatusConflict)
		return
	} else if err != nil {
		slog.With("err", err).Error("Failed to create stat")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func idValid(id string) bool {
	_, err := strconv.Atoi(id)
	return err == nil && id != ""
}
