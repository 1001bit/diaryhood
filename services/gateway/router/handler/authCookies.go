package handler

import (
	"net/http"
	"time"
)

func setAuthCookies(w http.ResponseWriter, access, refresh string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    access,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refresh,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/auth/refresh",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
	})
}

func removeAuthCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})
}
