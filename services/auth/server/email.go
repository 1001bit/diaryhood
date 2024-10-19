package server

import (
	"context"
	"log"
	"regexp"

	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/emailpb"
	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SendOTPEmail(ctx context.Context, req *authpb.OTPEmailRequest) (*authpb.OTPEmailResponse, error) {
	email, username, err := s.getEmailAndUsernameByLogin(ctx, req.Login)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// generate and store otp for some time
	otp, err := s.otpStorage.GenerateOTP(ctx, email)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// send otp by email
	_, err = s.emailclient.SendOTP(ctx, &emailpb.OTPRequest{
		Email: email,
		Otp:   otp,
		Name:  username,
	})
	if err != nil {
		return nil, err
	}

	// respond with email
	return &authpb.OTPEmailResponse{
		Email: email,
	}, nil
}

func (s *Server) getEmailAndUsernameByLogin(ctx context.Context, login string) (string, string, error) {
	// Ask userservice for email and username by login
	credentials, err := s.userclient.GetCredentials(ctx, &userpb.CredentialsRequest{
		Login: login,
	})

	if err == nil {
		// if there is such user
		return credentials.Email, credentials.Name, nil
	} else if status.Code(err) == codes.NotFound {
		// if no such user
		if !isEmail(login) {
			// if user send their username and there is no such username
			return "", "", status.Error(codes.NotFound, "not found")
		}
		// if user sent new email
		return login, "guest", nil
	} else {
		// other errors
		return "", "", err
	}
}

func isEmail(e string) bool {
	emailRegex := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	return emailRegex.MatchString(e)
}
