package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
)

func LoginPageHandler(w http.ResponseWriter, r *http.Request) {
	template.Login().Render(r.Context(), w)
}
