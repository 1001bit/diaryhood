package server

import (
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
)

type Server struct {
	pathstore *pathmodel.PathStore
}

func New(pathstore *pathmodel.PathStore) *Server {
	return &Server{
		pathstore: pathstore,
	}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.newRouter())
}
