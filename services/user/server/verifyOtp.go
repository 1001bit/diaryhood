package server

import (
	"context"
	"log/slog"

	"github.com/1001bit/pathgoer/services/user/accesstoken"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) VerifyOtp(ctx context.Context, req *userpb.VerifyOtpRequest) (*userpb.TokensResponse, error) {
	if !s.otpStorage.VerifyOTP(ctx, req.Email, req.Otp) {
		return nil, status.Error(codes.NotFound, "not found")
	}

	// Ask userservice for name and id by email
	username, id, err := s.userStore.GetNameAndIdByEmail(ctx, req.Email)
	if err != nil {
		slog.With("err", err).Error("Failed to get name and id by email")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	access, err := accesstoken.Generate(username)
	if err != nil {
		slog.With("err", err).Error("Failed to generate access token")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	refresh, err := s.refreshStorage.GenerateUUID(ctx, id)
	if err != nil {
		slog.With("err", err).Error("Failed to generate refresh token")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &userpb.TokensResponse{
		AccessJWT:   access,
		RefreshUUID: refresh,
	}, nil
}
