package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

func LogoutHandler(userclient userpb.UserServiceClient) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh")
		if err == nil {
			userclient.Logout(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
		}
		removeCookie(w, r, "access")
		removeCookie(w, r, "refresh")
		// http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}
