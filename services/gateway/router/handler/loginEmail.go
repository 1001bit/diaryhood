package handler

import (
	"encoding/json"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type LoginRequest struct {
	Login string `json:"login"`
}

type OTPRequest struct {
	Otp string `json:"otp"`
}

func LoginEmailHandler(userclient userpb.UserServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := &LoginRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		resp, err := userclient.SendOtpEmail(r.Context(), &userpb.SendOtpEmailRequest{Login: req.Login})
		if status.Code(err) == codes.NotFound {
			w.WriteHeader(http.StatusNotFound)
			return
		} else if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		setTemporaryLoginCookies(w, resp.Email)
	}
}

func setTemporaryLoginCookies(w http.ResponseWriter, email string) {
	// HACK: Also set temporaryId for better security
	// INSECURE
	http.SetCookie(w, &http.Cookie{
		Name:     "email",
		Value:    email,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/login/otp",
	})
}
