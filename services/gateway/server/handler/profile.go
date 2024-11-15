package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/server/middleware"
	"github.com/1001bit/pathgoer/services/gateway/template"
)

func HandleIDlessProfile(w http.ResponseWriter, r *http.Request) {
	username, ok := middleware.GetUsernameFromContext(r.Context())
	if !ok {
		template.RefreshOrLogin().Render(r.Context(), w)
		return
	}

	http.Redirect(w, r, "/user/"+username, http.StatusSeeOther)
}
