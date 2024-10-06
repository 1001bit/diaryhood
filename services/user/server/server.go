package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/storage/userpb"
)

type Server struct {
	userpb.UnimplementedUserServiceServer
}

func New() *Server {
	return &Server{}
}

func (s *Server) GetProfile(ctx context.Context, req *userpb.ProfileRequest) (*userpb.ProfileResponse, error) {
	// TODO: Get date from postgres

	return &userpb.ProfileResponse{
		Date: "TODO",
	}, nil
}
