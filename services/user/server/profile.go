package server

import (
	"context"
	"database/sql"
	"log"

	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) GetProfile(ctx context.Context, req *userpb.GetProfileRequest) (*userpb.GetProfileResponse, error) {
	profile, err := s.userStore.GetProfile(ctx, req.Name)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.GetProfileResponse{
		Name: profile.Name,
		Date: profile.Date,
	}, nil
}
