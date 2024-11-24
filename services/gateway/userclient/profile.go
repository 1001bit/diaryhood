package userclient

import (
	"net/http"
	"time"

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

	date, err := formatPostgresDate(response.Date)
	if err != nil {
		date = "unknown"
	}

	template.Profile(response.Name, date, response.Id).Render(r.Context(), w)
}

func formatPostgresDate(dateStr string) (string, error) {
	t, err := time.Parse("2006-01-02T15:04:05Z", dateStr)
	if err != nil {
		return "", err
	}

	return t.Format("2 January 2006"), nil
}
