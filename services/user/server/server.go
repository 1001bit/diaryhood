package server

import (
	"context"
	"database/sql"
	"log"

	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	userpb.UnimplementedUserServiceServer

	store *usermodel.UserStore
}

func New(store *usermodel.UserStore) *Server {
	return &Server{
		store: store,
	}
}

func (s *Server) GetProfile(ctx context.Context, req *userpb.ProfileRequest) (*userpb.ProfileResponse, error) {
	profile, err := s.store.GetProfile(ctx, req.Name)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.ProfileResponse{
		Name: profile.Name,
		Date: profile.Date,
	}, nil
}

func (s *Server) GetCredentials(ctx context.Context, req *userpb.CredentialsRequest) (*userpb.CredentialsResponse, error) {
	creds, err := s.store.GetCredentials(ctx, req.Login)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.CredentialsResponse{
		Name:  creds.Name,
		Email: creds.Email,
	}, nil
}

func (s *Server) Authenticate(ctx context.Context, req *userpb.AuthRequest) (*userpb.AuthResponse, error) {
	// TODO: Retreive data from db by email, or create a new user
	return &userpb.AuthResponse{
		Name: "bobie",
		Id:   1,
	}, nil
}
