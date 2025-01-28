package middleware

import (
	"context"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func CookieJwtClaimsToContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access")
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		claims, ok := accesstoken.ExtractClaims(cookie.Value)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
