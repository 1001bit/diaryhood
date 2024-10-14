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

func (s *Server) VerifyOTP(ctx context.Context, req *authpb.OTPRequest) (*authpb.JWTResponse, error) {
	if !s.otpStorage.VerifyOTP(ctx, req.Email, req.Otp) {
		return nil, status.Error(codes.NotFound, "not found")
	}

	// Ask userservice for name by email
	authResp, err := s.userclient.Authenticate(ctx, &userpb.AuthRequest{
		Email: req.Email,
	})
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &authpb.JWTResponse{
		Access:  authResp.Name + string(authResp.Id),
		Refresh: authResp.Name + string(authResp.Id),
	}, nil
}

func (s *Server) SendEmail(ctx context.Context, req *authpb.EmailRequest) (*authpb.EmailResponse, error) {
	var (
		email = "" // real email
		name  = "" // real name
	)

	// Ask userservice for email and username by login
	userResponse, err := s.userclient.GetCredentials(ctx, &userpb.CredentialsRequest{
		Login: req.Login,
	})

	if err == nil {
		// if there is such user
		email = userResponse.GetEmail()
		name = userResponse.GetName()
	} else if status.Code(err) == codes.NotFound {
		// if no such user
		if !isEmail(req.Login) {
			// if user send their username and there is no such username
			return nil, status.Error(codes.NotFound, "not found")
		}
		// if user sent new email
		email = req.Login
		name = "guest"
	} else {
		// other errors
		return nil, err
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
		Name:  name,
	})
	if err != nil {
		return nil, err
	}

	// respond with email
	return &authpb.EmailResponse{
		Email: email,
	}, nil
}

func isEmail(e string) bool {
	emailRegex := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	return emailRegex.MatchString(e)
}
