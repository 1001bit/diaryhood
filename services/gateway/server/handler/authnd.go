package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/accesstoken"
)

func HandleAuthenticated(w http.ResponseWriter, r *http.Request) {
	_, ok := accesstoken.GetClaimsFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
	} else {
		w.WriteHeader(http.StatusOK)
	}
}
