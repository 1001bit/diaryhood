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

func (s *Server) GetProfile(ctx context.Context, req *userpb.GetProfileRequest) (*userpb.GetProfileResponse, error) {
	profile, err := s.store.GetProfile(ctx, req.Name)

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

func (s *Server) GetCredentials(ctx context.Context, req *userpb.GetCredentialsRequest) (*userpb.GetCredentialsResponse, error) {
	creds, err := s.store.GetCredentials(ctx, req.Login)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.GetCredentialsResponse{
		Name:  creds.Name,
		Email: creds.Email,
	}, nil
}

func (s *Server) Login(ctx context.Context, req *userpb.LoginRequest) (*userpb.LoginResponse, error) {
	name, err := s.store.Login(ctx, req.Email)
	if err != nil {
		log.Println(err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &userpb.LoginResponse{
		Name: name,
	}, nil
}
