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

func Generate(username string) (string, error) {
	// generate jwt token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"exp": time.Now().Add(expiry).Unix(),
	})

	return token.SignedString([]byte(secret))
}
