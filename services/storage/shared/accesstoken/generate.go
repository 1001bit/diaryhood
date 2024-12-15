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

func Generate(userId string) (string, error) {
	// generate jwt token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"exp": time.Now().Add(expiry).Unix(),
		"user": Claims{
			Id: userId,
		},
	})

	return token.SignedString([]byte(secret))
}
