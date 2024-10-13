package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/email/emailpb"
)

type Server struct {
	emailpb.UnimplementedEmailServiceServer
}

func New() *Server {
	return &Server{}
}

func (s *Server) SendOTP(ctx context.Context, req *emailpb.OTPRequest) (*emailpb.EmailResponse, error) {
	// TODO: Actually send email
	log.Println(req.Email, req.Otp, req.Name)

	return nil, nil
}
