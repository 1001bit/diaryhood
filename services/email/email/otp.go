package email

import (
	"context"
	"log"
)

func SendOtpEmail(ctx context.Context, email, otp, name string) error {
	// TODO: Actually send email
	log.Printf("%s: Hello %s! Your one time password is %s\n", email, name, otp)

	return nil
}
