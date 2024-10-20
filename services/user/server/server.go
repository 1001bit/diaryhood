package server

import (
	"github.com/1001bit/pathgoer/services/user/emailpb"
	"github.com/1001bit/pathgoer/services/user/otp"
	"github.com/1001bit/pathgoer/services/user/refresh"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
)

type Server struct {
	userpb.UnimplementedUserServiceServer

	userStore      *usermodel.UserStore
	otpStorage     *otp.Storage
	refreshStorage *refresh.Storage
	emailClient    emailpb.EmailServiceClient
}

func New(userStore *usermodel.UserStore, otpStorage *otp.Storage, refreshStorage *refresh.Storage, emailClient emailpb.EmailServiceClient) *Server {
	return &Server{
		userStore:      userStore,
		otpStorage:     otpStorage,
		refreshStorage: refreshStorage,
		emailClient:    emailClient,
	}
}
