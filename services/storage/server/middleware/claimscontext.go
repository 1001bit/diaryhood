package middleware

import (
	"context"
	"net/http"

	"github.com/1001bit/pathgoer/services/storage/shared/accesstoken"
)

func JwtClaimsToContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// get jwt from header
		claims, ok := accesstoken.ExtractClaims(r.Header.Get("Authorization"))
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
