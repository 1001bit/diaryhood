package userclient

import (
	"net/http"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/pathmodel"
	"github.com/1001bit/pathgoer/services/gateway/server/middleware"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (c *Client) HandleProfile(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	askerName, _ := middleware.GetUsernameFromContext(r.Context())

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

	sameUser := response.Name == askerName

	date, err := formatPostgresDate(response.Date)
	if err != nil {
		date = "unknown"
	}

	// TODO: Get paths
	paths := []pathmodel.Path{
		{
			Id:   1,
			Name: "test",
			Stats: []pathmodel.Stat{
				{
					Name:           "test",
					Count:          1,
					StepEquivalent: 1,
				},
			},
		},
		{
			Id:   2,
			Name: "test",
			Stats: []pathmodel.Stat{
				{
					Name:           "test",
					Count:          2,
					StepEquivalent: 2,
				},
			},
		},
	}

	template.Profile(response.Name, date, paths, sameUser).Render(r.Context(), w)
}

func formatPostgresDate(dateStr string) (string, error) {
	t, err := time.Parse("2006-01-02T15:04:05Z", dateStr)
	if err != nil {
		return "", err
	}

	return t.Format("2 January 2006"), nil
}
