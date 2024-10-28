package sender

import (
	"context"
	"crypto/tls"
	"net/http"

	"github.com/mailgun/mailgun-go/v4"
)

type Sender struct {
	mg mailgun.Mailgun
}

func New(domain, apiKey string) *Sender {
	mg := mailgun.NewMailgun(domain, apiKey)
	// INSECURE
	mg.Client().Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // Disable verification
	}

	return &Sender{
		mg: mg,
	}
}

func (s *Sender) sendEmail(ctx context.Context, to, subject, body string) error {
	from := "pathgoer <mailgun@" + s.mg.Domain() + ">"
	m := s.mg.NewMessage(from, subject, body, to)
	_, _, err := s.mg.Send(ctx, m)
	return err
}
