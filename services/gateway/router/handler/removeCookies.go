package handler

import (
	"net/http"
)

func removeCookie(w http.ResponseWriter, r *http.Request, name string) {
	// FIXME: Make It WORK
	c, err := r.Cookie(name)
	if err == nil {
		c.Value = ""
		c.MaxAge = 0
		http.SetCookie(w, c)
	}
}
