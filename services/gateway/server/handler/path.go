package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandlePath(w http.ResponseWriter, r *http.Request) {
	template.Path().Render(r.Context(), w)
}
