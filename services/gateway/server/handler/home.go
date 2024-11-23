package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandleHome(w http.ResponseWriter, r *http.Request) {
	_, ok := accesstoken.GetClaimsFromContext(r.Context())

	if !ok {
		template.RefreshOrLoginPage().Render(r.Context(), w)
		return
	}

	template.Home().Render(r.Context(), w)
}
