package handler

import (
	"log"
	"net/http"
)

func removeCookie(w http.ResponseWriter, r *http.Request, name string, path string) {
	cookie, err := r.Cookie(name)
	if err == nil {
		log.Println(name, cookie.Value, cookie.Path)
		http.SetCookie(w, &http.Cookie{
			Name:   name,
			Value:  "",
			Path:   path,
			MaxAge: -1,
		})
	}
}
