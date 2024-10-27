package sender

import (
	"context"
	"fmt"
)

func (s *Sender) SendOtp(ctx context.Context, email, name, otp string) error {
	body := fmt.Sprintf("Hello, %s! Your verification code is: %s", name, otp)
	return s.sendEmail(ctx, email, "pathgoer verification code", body)
}
