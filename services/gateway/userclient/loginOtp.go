package userclient

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/cookiemanager"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type OTPRequest struct {
	Otp   string `json:"otp"`
	Email string `json:"email"`
}

func (c *Client) HandleLoginOtp(w http.ResponseWriter, r *http.Request) {
	req := &OTPRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	tokens, err := c.serviceClient.VerifyOtp(r.Context(), &userpb.VerifyOtpRequest{
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

	setAuthCookies(w, tokens.AccessJWT, tokens.RefreshUUID)

	w.WriteHeader(http.StatusOK)
}

func setAuthCookies(w http.ResponseWriter, access, refresh string) {
	cookiemanager.Set(w, &http.Cookie{
		Name:     "access",
		Value:    access,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/",
	})

	cookiemanager.Set(w, &http.Cookie{
		Name:     "refresh",
		Value:    refresh,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/auth",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
	})
}
