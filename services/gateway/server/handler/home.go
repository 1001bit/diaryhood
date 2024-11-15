package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/server/middleware"
	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandleHome(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUsernameFromContext(r.Context())
	if !ok {
		template.RefreshOrLogin().Render(r.Context(), w)
		return
	}

	template.Home().Render(r.Context(), w)
}
