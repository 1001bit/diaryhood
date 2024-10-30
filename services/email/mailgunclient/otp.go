package mailgunclient

import (
	"context"
	"fmt"
)

func (c *Client) SendOtp(ctx context.Context, email, name, otp string) error {
	body := fmt.Sprintf("Hello, %s! Your verification code is: %s", name, otp)
	return c.sendEmail(ctx, email, "pathgoer verification code", body)
}
