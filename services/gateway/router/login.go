package router

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/authclient"
	"github.com/1001bit/pathgoer/services/gateway/authpb"
)

type UserRequest struct {
	Login string `json:"login"`
}

func LoginHandler(client *authclient.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &UserRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		resp, err := client.SendEmail(r.Context(), &authpb.EmailRequest{Login: req.Login})
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.Write([]byte(fmt.Sprintf(
			`{"newAccount": %t}`, resp.NewAccount,
		)))
	}
}
