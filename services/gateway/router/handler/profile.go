package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

func HandleIdlessProfile(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value("username").(string)
	if !ok {
		template.RefreshOrLogin().Render(r.Context(), w)
		return
	}

	http.Redirect(w, r, "/profile/"+username, http.StatusSeeOther)
}

func ProfileHandler(userclient userpb.UserServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		response, err := userclient.GetProfile(r.Context(), &userpb.ProfileRequest{Name: name})
		if err != nil {
			// HACK: Handle both 404 and 500 errors
			template.ErrorNotFound().Render(r.Context(), w)
			w.WriteHeader(http.StatusNotFound)
			return
		}

		template.Profile(response.Name, response.Date).Render(r.Context(), w)
	}
}
