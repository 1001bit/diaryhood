package server

import (
	"context"
	"log/slog"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) CreatePath(ctx context.Context, req *pathpb.CreatePathRequest) (*pathpb.CreatePathResponse, error) {
	path := pathmodel.Path{
		Id:     req.Id,
		UserId: req.UserId,
		Name:   req.Name,
		Public: req.Public,
		Steps:  req.Steps,
		Stats:  req.OtherStats,
	}

	err := s.pathstore.CreatePath(ctx, path)
	if err != nil {
		slog.With("err", err).Error("Failed to create path")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &pathpb.CreatePathResponse{}, nil
}
