package server

import (
	"log/slog"
	"net"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
	"google.golang.org/grpc"
)

type Server struct {
	pathpb.UnimplementedPathServiceServer

	pathstore *pathmodel.PathStore
}

func New(pathstore *pathmodel.PathStore) *Server {
	return &Server{
		pathstore: pathstore,
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
	pathpb.RegisterPathServiceServer(grpcServer, s)

	// start grpc server
	return grpcServer.Serve(lis)
}
