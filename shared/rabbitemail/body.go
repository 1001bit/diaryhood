package rabbitemail

import (
	"errors"
	"strings"
)

var ErrBadBody = errors.New("invalid body format")

type EmailBody struct {
	Email string
	Name  string
	Otp   string
}

func VerifyBody(body []byte) (*EmailBody, error) {
	bodySplit := strings.Split(string(body), " ")
	if len(bodySplit) != 3 {
		return nil, ErrBadBody
	}

	return &EmailBody{
		Email: bodySplit[0],
		Name:  bodySplit[1],
		Otp:   bodySplit[2],
	}, nil
}

func NewBody(email, name, otp string) string {
	return email + " " + name + " " + otp
}
