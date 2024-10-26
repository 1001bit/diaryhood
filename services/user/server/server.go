package server

import (
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
}

func New(userStore *usermodel.UserStore, otpStorage *otp.Storage, refreshStorage *refresh.Storage) *Server {
	return &Server{
		userStore:      userStore,
		otpStorage:     otpStorage,
		refreshStorage: refreshStorage,
	}
}
