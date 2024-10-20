package otp

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

func generateOTP() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(999999)) // Generates a 6-digit OTP
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n), nil
}
