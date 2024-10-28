package server

import (
	"github.com/1001bit/pathgoer/services/user/emailrmq"
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
	emailrmq       *emailrmq.EmailRmq
}

func New(userStore *usermodel.UserStore, otpStorage *otp.Storage, refreshStorage *refresh.Storage, emailrmq *emailrmq.EmailRmq) *Server {
	return &Server{
		userStore:      userStore,
		otpStorage:     otpStorage,
		refreshStorage: refreshStorage,
		emailrmq:       emailrmq,
	}
}
