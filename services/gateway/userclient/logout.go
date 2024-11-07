package userclient

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/router/handler"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
)

func (c *Client) HandleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh")
	if err == nil {
		c.serviceClient.Logout(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
	}

	handler.RemoveCookie(w, r, "refresh", "/auth")
	handler.RemoveCookie(w, r, "access", "/")
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
