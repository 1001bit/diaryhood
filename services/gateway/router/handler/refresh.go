package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

func RefreshHandler(userclient userpb.UserServiceClient) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		tokens, err := userclient.RefreshTokens(r.Context(), &userpb.RefreshTokensRequest{RefreshUUID: cookie.Value})
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		setAuthCookies(w, tokens.AccessJWT, tokens.RefreshUUID)
		w.WriteHeader(http.StatusOK)
	}
}
