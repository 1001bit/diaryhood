package userclient

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/cookiemanager"
	"github.com/1001bit/pathgoer/services/gateway/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (c *Client) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	if _, ok := accesstoken.GetClaimsFromContext(r.Context()); ok {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	cookie, err := r.Cookie("refresh")
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	tokens, err := c.serviceClient.RefreshTokens(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
	if status.Code(err) == codes.Unauthenticated {
		cookiemanager.Remove(w, r, "refresh", "/auth")
		cookiemanager.Remove(w, r, "access", "/")
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	setAccessCookie(w, tokens.AccessJWT)
	setRefreshCookie(w, tokens.RefreshUUID)
	w.WriteHeader(http.StatusOK)
}
