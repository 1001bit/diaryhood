package server

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"net/mail"

	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SendOtpEmail(ctx context.Context, req *userpb.SendOtpEmailRequest) (*userpb.SendOtpEmailResponse, error) {
	creds, err := s.userStore.GetCredentials(ctx, req.Login)
	if err == sql.ErrNoRows {
		if !emailValid(req.Login) {
			return nil, status.Error(codes.NotFound, "no such user")
		}

		creds = &usermodel.Credentials{
			Email: req.Login,
			Name:  "guest",
		}
	} else if err != nil {
		slog.With("err", err).Error("Failed to get credentials by login")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// generate and store otp for some time
	otp, err := s.otpStorage.GenerateOTP(ctx, creds.Email)
	if err != nil {
		slog.With("err", err).Error("Failed to generate OTP")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// send otp to rabbitmq queue
	err = s.publisher.Publish("email", fmt.Sprintf("%s %s %s", creds.Email, creds.Name, otp))
	if err != nil {
		slog.With("err", err).Error("Failed to publish email to RabbitMQ")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// respond with email
	return &userpb.SendOtpEmailResponse{
		Email: creds.Email,
	}, nil
}

func emailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
