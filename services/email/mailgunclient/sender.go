package mailgunclient

import (
	"context"
	"crypto/tls"
	"net/http"

	"github.com/mailgun/mailgun-go/v4"
)

type Client struct {
	mg mailgun.Mailgun
}

func New(domain, apiKey string) *Client {
	mg := mailgun.NewMailgun(domain, apiKey)
	// INSECURE
	mg.Client().Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // Disable verification
	}

	return &Client{
		mg: mg,
	}
}

func (c *Client) sendEmail(ctx context.Context, to, subject, body string) error {
	from := "pathgoer <mailgun@" + c.mg.Domain() + ">"
	m := c.mg.NewMessage(from, subject, body, to)
	_, _, err := c.mg.Send(ctx, m)
	return err
}
