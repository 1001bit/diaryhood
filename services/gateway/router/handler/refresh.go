package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func RefreshHandler(userclient userpb.UserServiceClient) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		tokens, err := userclient.RefreshTokens(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
		if status.Code(err) == codes.Unauthenticated {
			removeCookie(w, r, "access")
			removeCookie(w, r, "refresh")
			w.WriteHeader(http.StatusUnauthorized)
			return
		} else if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		setAuthCookies(w, tokens.AccessJWT, tokens.RefreshUUID)
		w.WriteHeader(http.StatusOK)
	}
}
