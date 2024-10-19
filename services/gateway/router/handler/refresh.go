package handler

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/authpb"
)

func RefreshHandler(authclient authpb.AuthServiceClient) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		tokens, err := authclient.Refresh(r.Context(), &authpb.RefreshRequest{Refresh: cookie.Value})
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		setAuthCookies(w, tokens.Access, tokens.Refresh)
		w.WriteHeader(http.StatusOK)
	}
}
