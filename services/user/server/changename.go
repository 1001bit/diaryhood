package server

import (
	"context"
	"database/sql"
	"log/slog"
	"regexp"

	"github.com/1001bit/pathgoer/services/user/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"github.com/lib/pq"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) ChangeUsername(ctx context.Context, req *userpb.ChangeUsernameRequest) (*userpb.ChangeUsernameResponse, error) {
	if !nameValid(req.NewName) {
		return nil, status.Error(codes.InvalidArgument, "invalid username")
	}

	err := s.userStore.ChangeUsername(ctx, req.Id, req.NewName)
	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err, ok := err.(*pq.Error); ok && err.Code == "23505" {
		return nil, status.Error(codes.AlreadyExists, "username already exists")
	} else if err != nil {
		slog.With("err", err).Error("Failed to change username")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	access, err := accesstoken.Generate(req.NewName, req.Id)
	if err != nil {
		slog.With("err", err).Error("Failed to generate access token")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &userpb.ChangeUsernameResponse{
		AccessJWT: access,
	}, nil
}

func nameValid(s string) bool {
	// Define the regex pattern
	pattern := `^[a-zA-Z0-9_]+$`
	// Compile the regex
	re := regexp.MustCompile(pattern)
	// Match the string against the pattern
	return re.MatchString(s) && len(s) <= 31 && len(s) > 0
}
