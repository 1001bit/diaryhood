package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/auth/accesstoken"
	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) VerifyOTP(ctx context.Context, req *authpb.VerifyRequest) (*authpb.TokensResponse, error) {
	if !s.otpStorage.VerifyOTP(ctx, req.Email, req.Otp) {
		return nil, status.Error(codes.NotFound, "not found")
	}

	// Ask userservice for name by email
	authResp, err := s.userclient.Login(ctx, &userpb.LoginRequest{
		Email: req.Email,
	})
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	access, err := accesstoken.Generate(authResp.Name)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	refresh, err := s.uuidStorage.GenerateUUID(ctx, authResp.Name)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &authpb.TokensResponse{
		Access:  access,
		Refresh: refresh,
	}, nil
}
