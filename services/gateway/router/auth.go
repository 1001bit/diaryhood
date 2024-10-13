package router

import (
	"encoding/json"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/authpb"
)

type LoginRequest struct {
	Login string `json:"login"`
}

type OTPRequest struct {
	Login string `json:"login"`
	Otp   string `json:"otp"`
}

func LoginHandler(client authpb.AuthServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &LoginRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		_, err = client.SendEmail(r.Context(), &authpb.EmailRequest{Login: req.Login})
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

func OTPHandler(client authpb.AuthServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &OTPRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		resp, err := client.VerifyOTP(r.Context(), &authpb.OTPRequest{
			Login: req.Login,
			Otp:   req.Otp,
		})
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		// TODO: Set JWTs
		w.Write([]byte(`{"name":"` + resp.Name + `"}`))
	}
}
