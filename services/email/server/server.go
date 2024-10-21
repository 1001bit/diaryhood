package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/email/email"
	"github.com/1001bit/pathgoer/services/email/emailpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	emailpb.UnimplementedEmailServiceServer
}

func New() *Server {
	return &Server{}
}

func (s *Server) SendOTP(ctx context.Context, req *emailpb.OTPRequest) (*emailpb.EmailResponse, error) {
	err := email.SendOtpEmail(ctx, req.Email, req.Otp, req.Name)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return nil, nil
}
