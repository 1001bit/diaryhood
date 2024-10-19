package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
)

func LoginPageHandler(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username")
	if username != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	template.Login().Render(r.Context(), w)
}
