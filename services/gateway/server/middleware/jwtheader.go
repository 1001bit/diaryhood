package middleware

import (
	"net/http"
)

func JwtToHeader(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access")
		if err == nil {
			r.Header.Set("Authorization", cookie.Value)
		}

		next.ServeHTTP(w, r)
	})
}
