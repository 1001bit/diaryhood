package server

import (
	"context"
	"log"

	"github.com/1001bit/pathgoer/services/user/accesstoken"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) RefreshTokens(ctx context.Context, req *userpb.RefreshTokensRequest) (*userpb.TokensResponse, error) {
	userID, uuid, err := s.refreshStorage.GetUserIDAndRefresh(ctx, req.RefreshUUID)
	if err == redis.Nil {
		return nil, status.Error(codes.Unauthenticated, "could not refresh")
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	// Get username by userID
	username, err := s.userStore.GetNameByID(ctx, userID)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	access, err := accesstoken.Generate(username)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &userpb.TokensResponse{
		AccessJWT:   access,
		RefreshUUID: uuid,
	}, nil
}
