package accesstoken

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

func ExtractUsername(tokenString string) (string, bool) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
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
