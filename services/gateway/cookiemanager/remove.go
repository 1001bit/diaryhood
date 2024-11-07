package cookiemanager

import (
	"net/http"
)

func Remove(w http.ResponseWriter, r *http.Request, name string, path string) {
	_, err := r.Cookie(name)
	if err == nil {
		http.SetCookie(w, &http.Cookie{
			Name:   name,
			Value:  "",
			Path:   path,
			MaxAge: -1,
		})
	}
}
