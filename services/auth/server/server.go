package server

import (
	"context"
	"log"
	"regexp"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/emailpb"
	"github.com/1001bit/pathgoer/services/auth/otp"
	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	authpb.UnimplementedAuthServiceServer

	userclient  userpb.UserServiceClient
	emailclient emailpb.EmailServiceClient
	otpStorage  *otp.Storage
}

func New(userclient userpb.UserServiceClient, emailclient emailpb.EmailServiceClient, otpStorage *otp.Storage) *Server {
	return &Server{
		userclient:  userclient,
		emailclient: emailclient,
		otpStorage:  otpStorage,
	}
}

func (s *Server) SendEmail(ctx context.Context, req *authpb.EmailRequest) (*authpb.EmailResponse, error) {
	userResponse, err := s.userclient.GetCredentials(ctx, &userpb.CredentialsRequest{
		Login: req.Login,
	})

	name := "guest"
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

	otp, err := s.otpStorage.GenerateOTP(ctx, email)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	_, err = s.emailclient.SendOTP(ctx, &emailpb.OTPRequest{
		Email: email,
		Otp:   otp,
		Name:  name,
	})
	if err != nil {
		return nil, err
	}

	return &authpb.EmailResponse{}, nil
}

func isEmail(e string) bool {
	emailRegex := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	return emailRegex.MatchString(e)
}
