package userclient

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/router/handler"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (c *Client) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh")
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	tokens, err := c.serviceClient.RefreshTokens(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
	if status.Code(err) == codes.Unauthenticated {
		handler.RemoveCookie(w, r, "refresh", "/auth")
		handler.RemoveCookie(w, r, "access", "/")
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	setAuthCookies(w, tokens.AccessJWT, tokens.RefreshUUID)
	w.WriteHeader(http.StatusOK)
}
