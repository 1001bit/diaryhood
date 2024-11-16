package server

import (
	"log/slog"
	"net"

	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitclient"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"google.golang.org/grpc"
)

type Server struct {
	userpb.UnimplementedUserServiceServer

	userStore      *usermodel.UserStore
	otpStorage     *otpstorage.Storage
	refreshStorage *refreshstorage.Storage
	rabbitClient   *rabbitclient.Client
}

func New(
	userStore *usermodel.UserStore,
	otpStorage *otpstorage.Storage,
	refreshStorage *refreshstorage.Storage,
	rabbitClient *rabbitclient.Client,
) *Server {
	return &Server{
		userStore:      userStore,
		otpStorage:     otpStorage,
		refreshStorage: refreshStorage,
		rabbitClient:   rabbitClient,
	}
}

func (s *Server) Start(addr string) error {
	slog.With("addr", addr).Info("Starting gRPC server")

	// start tcp listener
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, s)

	// start grpc server
	return grpcServer.Serve(lis)
}
