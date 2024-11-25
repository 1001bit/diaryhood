package userclient

import (
	"encoding/json"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ChangeNameRequest struct {
	NewName string `json:"name"`
}

func (c *Client) HandleChangeUsername(w http.ResponseWriter, r *http.Request) {
	claims, ok := accesstoken.GetClaimsFromContext(r.Context())
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

	_, err = c.serviceClient.ChangeUsername(r.Context(), &userpb.ChangeUsernameRequest{
		Id:      claims.Id,
		NewName: req.NewName,
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

	w.WriteHeader(http.StatusOK)
}
