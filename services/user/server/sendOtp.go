package server

import (
	"context"
	"database/sql"
	"log/slog"
	"net/mail"

	"github.com/1001bit/pathgoer/services/user/shared/rabbitemail"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SendOtpEmail(ctx context.Context, req *userpb.SendOtpEmailRequest) (*userpb.SendOtpEmailResponse, error) {
	name, email, err := s.userStore.GetNameAndEmail(ctx, req.Login)
	if err == sql.ErrNoRows {
		if !emailValid(req.Login) {
			return nil, status.Error(codes.NotFound, "no such user")
		}

		name = "guest"
		email = req.Login
	} else if err != nil {
		slog.With("err", err).Error("Failed to get credentials by login")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// generate and store otp for some time
	otp, err := s.otpStorage.GenerateOTP(ctx, email)
	if err != nil {
		slog.With("err", err).Error("Failed to generate OTP")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// send otp to rabbitmq queue
	err = s.publisher.Publish("email", rabbitemail.NewBody(email, name, otp))
	if err != nil {
		slog.With("err", err).Error("Failed to publish email to RabbitMQ")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// respond with email
	return &userpb.SendOtpEmailResponse{
		Email: email,
	}, nil
}

func emailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
