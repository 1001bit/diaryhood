package userclient

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type LoginRequest struct {
	Login string `json:"login"`
}

func (c *Client) HandleLoginEmail(w http.ResponseWriter, r *http.Request) {
	req := &LoginRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resp, err := c.serviceClient.SendOtpEmail(r.Context(), &userpb.SendOtpEmailRequest{Login: req.Login})
	if status.Code(err) == codes.NotFound {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, `{"email": "%s"}`, resp.Email)
}
