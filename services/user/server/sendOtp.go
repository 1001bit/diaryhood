package server

import (
	"context"
	"database/sql"
	"log"

	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SendOtpEmail(ctx context.Context, req *userpb.SendOtpEmailRequest) (*userpb.SendOtpEmailResponse, error) {
	creds, err := s.userStore.GetCredentials(ctx, req.Login)
	if err == sql.ErrNoRows {
		creds = &usermodel.Credentials{
			Email: req.Login,
			Name:  "guest",
		}
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// generate and store otp for some time
	otp, err := s.otpStorage.GenerateOTP(ctx, creds.Email)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// send otp to rabbitmq queue
	err = s.emailpub.SendOTP(ctx, creds.Email, creds.Name, otp)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// respond with email
	return &userpb.SendOtpEmailResponse{
		Email: creds.Email,
	}, nil
}
