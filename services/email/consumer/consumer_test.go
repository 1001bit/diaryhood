package consumer

import (
	"context"
	"errors"
	"net/mail"
	"testing"

	"github.com/1001bit/pathgoer/services/email/rmqemail"
)

var ErrBadEmail = errors.New("invalid email")

// EmailSenderMock
type EmailSenderMock struct {
}

func (m EmailSenderMock) SendOtp(ctx context.Context, email, name, otp string) error {
	if !emailValid(email) {
		return ErrBadEmail
	}
	return nil
}

// Test
func TestHandleQueueMessage(t *testing.T) {
	tests := []struct {
		body []byte
		want error
	}{
		{[]byte("bademail name1 123456"), ErrBadEmail},
		{[]byte("good@gmail.com name1 123456"), nil},
		{[]byte("nomail 123456"), rmqemail.ErrBadBody},
	}

	sender := EmailSenderMock{}

	for _, tt := range tests {
		t.Run(string(tt.body), func(t *testing.T) {
			err := handleQueueMessage(tt.body, sender)
			if err != tt.want {
				t.Errorf("handleQueueMessage() error = %v, wantErr %v", err, tt.want)
			}
		})
	}
}

func emailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
