package server

import (
	"github.com/1001bit/pathgoer/services/auth/authpb"
	"github.com/1001bit/pathgoer/services/auth/emailpb"
	"github.com/1001bit/pathgoer/services/auth/otp"
	"github.com/1001bit/pathgoer/services/auth/refresh"
	"github.com/1001bit/pathgoer/services/auth/userpb"
)

type Server struct {
	authpb.UnimplementedAuthServiceServer

	userclient  userpb.UserServiceClient
	emailclient emailpb.EmailServiceClient
	otpStorage  *otp.Storage
	uuidStorage *refresh.Storage
}

func New(userclient userpb.UserServiceClient, emailclient emailpb.EmailServiceClient, otpStorage *otp.Storage, uuidStorage *refresh.Storage) *Server {
	return &Server{
		userclient:  userclient,
		emailclient: emailclient,
		otpStorage:  otpStorage,
		uuidStorage: uuidStorage,
	}
}
