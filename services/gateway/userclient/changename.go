package userclient

import (
	"encoding/json"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/server/middleware"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ChangeNameRequest struct {
	NewName string `json:"name"`
}

func (c *Client) HandleChangeUsername(w http.ResponseWriter, r *http.Request) {
	username, ok := middleware.GetUsernameFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	req := &ChangeNameRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resp, err := c.serviceClient.ChangeUsername(r.Context(), &userpb.ChangeUsernameRequest{
		NewName: req.NewName,
		OldName: username,
	})

	if status.Code(err) == codes.NotFound {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if status.Code(err) == codes.InvalidArgument {
		w.WriteHeader(http.StatusBadRequest)
		return
	} else if status.Code(err) == codes.AlreadyExists {
		w.WriteHeader(http.StatusConflict)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	setAccessCookie(w, resp.AccessJWT)

	w.WriteHeader(http.StatusOK)
}
