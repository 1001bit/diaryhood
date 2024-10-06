package router

import (
	"log"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ProfileHandler(userclient *userclient.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		response, err := userclient.GetProfile(r.Context(), &userpb.ProfileRequest{Name: name})
		if err != nil {
			if status.Code(err) != codes.NotFound {
				log.Println(err)
			}
			w.WriteHeader(http.StatusNotFound)
			return
		}

		template.Profile(response.Name, response.Date).Render(r.Context(), w)
	}
}
