package router

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

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
