package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
	"github.com/lib/pq"
)

type CreatePathRequest struct {
	Name string `json:"name"`
}

func (h *Handler) HandleCreatePath(w http.ResponseWriter, r *http.Request) {
	claims, ok := accesstoken.GetClaimsFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	req := &CreatePathRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if !nameValid(req.Name) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	id, err := h.pathstore.CreatePath(r.Context(), claims.Id, req.Name)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err, ok := err.(*pq.Error); ok && err.Code == "23505" {
		w.WriteHeader(http.StatusConflict)
		return
	} else if err != nil {
		slog.With("err", err).Error("Failed to create path")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, `{"id": %s}`, id)
}

func nameValid(s string) bool {
	// Define the regex pattern
	pattern := `^[a-zA-Z0-9_]+$`
	// Compile the regex
	re := regexp.MustCompile(pattern)
	// Match the string against the pattern
	return re.MatchString(s) && len(s) <= 31 && len(s) > 0
}
