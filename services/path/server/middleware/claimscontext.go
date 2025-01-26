package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func JwtClaimsToContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// get jwt from header
		header := r.Header.Get("Authorization")
		token := ""
		if strings.HasPrefix(header, "Bearer ") {
			token = strings.TrimPrefix(header, "Bearer ")
		} else {
			next.ServeHTTP(w, r)
			return
		}

		claims, ok := accesstoken.ExtractClaims(token)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
