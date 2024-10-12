package server

import (
	"github.com/1001bit/pathgoer/services/auth/authpb"
)

type Server struct {
	authpb.UnimplementedAuthServiceServer
}

func New() *Server {
	return &Server{}
}

// func (s *Server) Authenticate(ctx context.Context, req *authpb.AuthRequest) (*authpb.AuthResponse, error) {
// 	return nil, nil
// }
