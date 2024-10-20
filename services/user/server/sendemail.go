package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/user/emailpb"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SendOtpEmail(ctx context.Context, req *userpb.SendOtpEmailRequest) (*userpb.SendOtpEmailResponse, error) {
	creds, err := s.userStore.GetCredentials(ctx, req.Login)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// generate and store otp for some time
	otp, err := s.otpStorage.GenerateOTP(ctx, creds.Email)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// send otp by email
	_, err = s.emailClient.SendOTP(ctx, &emailpb.OTPRequest{
		Email: creds.Email,
		Otp:   otp,
		Name:  creds.Name,
	})
	if err != nil {
		return nil, err
	}

	// respond with email
	return &userpb.SendOtpEmailResponse{
		Email: creds.Email,
	}, nil
}
