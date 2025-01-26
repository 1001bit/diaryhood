package middleware

import (
	"net/http"
)

func JwtToHeader(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if cookie, err := r.Cookie("access"); err == nil {
			r.Header.Set("Authorization", "Bearer "+cookie.Value)
		}

		next.ServeHTTP(w, r)
	})
}
