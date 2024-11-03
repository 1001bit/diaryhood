package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func (s *Server) CreatePath(ctx context.Context, req *pathpb.CreatePathRequest) (*pathpb.Empty, error) {
	path := pathmodel.Path{
		UserId: req.UserId,
		Name:   req.PathName,
		Public: req.Public,
	}

	err := s.pathstore.CreatePath(ctx, path)
	if err != nil {
		return nil, handleSqlError(err, "Failed to create path")
	}

	return &pathpb.Empty{}, nil
}
