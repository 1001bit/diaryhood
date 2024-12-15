package middleware

import (
	"fmt"
	"net/http"
	"time"
)

func Cache(dur time.Duration) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(dur.Seconds()))) // Cache for one day
			next.ServeHTTP(w, r)
		})
	}
}
