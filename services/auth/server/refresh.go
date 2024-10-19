package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/auth/accesstoken"
	"github.com/1001bit/pathgoer/services/auth/authpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) Refresh(ctx context.Context, req *authpb.RefreshRequest) (*authpb.TokensResponse, error) {
	username, uuid, err := s.uuidStorage.GetUsernameAndRefresh(ctx, req.Refresh)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "could not refresh")
	}

	access, err := accesstoken.Generate(username)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &authpb.TokensResponse{
		Access:  access,
		Refresh: uuid,
	}, nil
}
