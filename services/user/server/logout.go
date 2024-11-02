package server

import (
	"context"
	"log/slog"

	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) Logout(ctx context.Context, req *userpb.RefreshTokenRequest) (*userpb.Empty, error) {
	// Delete refresh token
	if err := s.refreshStorage.DeleteUUID(ctx, req.RefreshUUID); err == redis.Nil {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		slog.With("err", err).Error("Failed to delete refresh token")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &userpb.Empty{}, nil
}
