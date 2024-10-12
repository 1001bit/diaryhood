package server

import (
	"context"
	"log"
	"regexp"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/userclient"
	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	authpb.UnimplementedAuthServiceServer

	userclient *userclient.Client
}

func New(userclient *userclient.Client) *Server {
	return &Server{
		userclient: userclient,
	}
}

func (s *Server) SendEmail(ctx context.Context, req *authpb.EmailRequest) (*authpb.EmailResponse, error) {
	userResponse, err := s.userclient.GetCredentials(ctx, &userpb.CredentialsRequest{
		Login: req.Login,
	})

	name := ""
	email := ""

	if err != nil {
		if !isEmail(req.Login) {
			return nil, status.Error(codes.NotFound, "not found")
		}
		// if user send their username and there is no such username
		email = req.Login
	} else {
		email = userResponse.GetEmail()
		name = userResponse.GetName()
	}

	// TODO: Send email with OTP
	log.Println(email, name)

	return &authpb.EmailResponse{
		NewAccount: len(name) == 0,
	}, nil
}

func isEmail(e string) bool {
	emailRegex := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	return emailRegex.MatchString(e)
}
