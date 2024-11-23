package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandleIDlessProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := accesstoken.GetClaimsFromContext(r.Context())
	if !ok {
		template.RefreshOrLoginPage().Render(r.Context(), w)
		return
	}

	http.Redirect(w, r, "/user/"+claims.Name, http.StatusSeeOther)
}
