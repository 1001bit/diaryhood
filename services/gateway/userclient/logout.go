package userclient

import (
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/cookiemanager"
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
)

func (c *Client) HandleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh")
	if err == nil {
		c.serviceClient.Logout(r.Context(), &userpb.RefreshTokenRequest{RefreshUUID: cookie.Value})
	}

	cookiemanager.Remove(w, r, "refresh", "/auth")
	cookiemanager.Remove(w, r, "access", "/")
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
