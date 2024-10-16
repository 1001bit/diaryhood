package router

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/authpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type LoginRequest struct {
	Login string `json:"login"`
}

type OTPRequest struct {
	Email string `json:"email"`
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

		resp, err := client.SendOTPEmail(r.Context(), &authpb.OTPEmailRequest{Login: req.Login})
		if status.Code(err) == codes.NotFound {
			w.WriteHeader(http.StatusNotFound)
			return
		} else if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, `{"email":"%s"}`, resp.Email)
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

		resp, err := client.Login(r.Context(), &authpb.LoginRequest{
			Email: req.Email,
			Otp:   req.Otp,
		})
		if status.Code(err) == codes.NotFound {
			w.WriteHeader(http.StatusNotFound)
			return
		} else if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// TODO: Set JWTs from response
		_ = resp.Access
		_ = resp.Refresh

		w.WriteHeader(http.StatusOK)
	}
}
