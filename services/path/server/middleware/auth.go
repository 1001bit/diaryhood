package middleware

import (
	"context"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

var secret = []byte(os.Getenv("JWT_SECRET"))

func JwtClaimsToContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		username, ok := getUsernameFromHeader(r)
		if ok {
			ctx := context.WithValue(r.Context(), "username", username)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getUsernameFromHeader(r *http.Request) (string, bool) {
	token, err := jwt.Parse(r.Header.Get("Authorization"), func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return "", false
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return "", false
	}

	username, err := claims.GetSubject()
	if err != nil {
		return "", false
	}

	return username, true
}
