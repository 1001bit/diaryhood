package accesstoken

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	secret = os.Getenv("JWT_SECRET")
	expiry = time.Minute * 10
)

func Generate(username, userId string) (string, error) {
	// generate jwt token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"exp": time.Now().Add(expiry).Unix(),
		"user": Claims{
			Name: username,
			Id:   userId,
		},
	})

	return token.SignedString([]byte(secret))
}
