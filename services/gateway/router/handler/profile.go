package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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

		response, err := userclient.GetProfile(r.Context(), &userpb.GetProfileRequest{Name: name})
		if status.Code(err) == codes.NotFound {
			template.ErrorNotFound().Render(r.Context(), w)
			w.WriteHeader(http.StatusNotFound)
			return
		} else if err != nil {
			template.ErrorInternal().Render(r.Context(), w)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		template.Profile(response.Name, response.Date).Render(r.Context(), w)
	}
}
