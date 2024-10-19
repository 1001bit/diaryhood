package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandleHome(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value("username").(string)
	if !ok {
		template.RefreshOrLogin().Render(r.Context(), w)
		return
	}

	template.Home().Render(r.Context(), w)
}
