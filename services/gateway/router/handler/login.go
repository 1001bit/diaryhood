package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

func LoginEmailHandler(client authpb.AuthServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &LoginRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		resp, err := client.SendOTPEmail(r.Context(), &authpb.SendOTPEmailRequest{Login: req.Login})
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

func LoginOTPHandler(client authpb.AuthServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &OTPRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		tokens, err := client.VerifyOTP(r.Context(), &authpb.VerifyOTPRequest{
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

		setAuthCookies(w, tokens.Access, tokens.Refresh)

		w.WriteHeader(http.StatusOK)
	}
}

func setAuthCookies(w http.ResponseWriter, access, refresh string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    access,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refresh,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/auth/refresh",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
	})
}
