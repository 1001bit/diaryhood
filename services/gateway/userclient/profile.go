package userclient

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (c *Client) HandleProfile(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")

	response, err := c.serviceClient.GetProfile(r.Context(), &userpb.GetProfileRequest{Name: name})
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
