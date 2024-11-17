package server

import (
	"context"
	"database/sql"
	"log/slog"

	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) GetProfile(ctx context.Context, req *userpb.GetProfileRequest) (*userpb.GetProfileResponse, error) {
	profile, err := s.userStore.GetProfileByName(ctx, req.Name)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		slog.With("err", err).Error("Failed to get profile")
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.GetProfileResponse{
		Name: profile.Name,
		Date: profile.Date,
		Id:   profile.Id,
	}, nil
}
