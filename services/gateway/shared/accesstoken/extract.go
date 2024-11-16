package accesstoken

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

func ExtractClaims(tokenString string) (Claims, bool) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return Claims{}, false
	}

	mapClaims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return Claims{}, false
	}

	return Claims{
		Name: mapClaims["user"].(map[string]interface{})["name"].(string),
		Id:   mapClaims["user"].(map[string]interface{})["id"].(string),
	}, true
}
