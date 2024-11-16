package server

import (
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/gateway/httpproxy"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
)

type Server struct {
	userclient *userclient.Client

	storageproxy *httpproxy.Proxy
	pathproxy    *httpproxy.Proxy
}

func New(userclient *userclient.Client, storageproxy, pathProxy *httpproxy.Proxy) *Server {
	return &Server{
		userclient:   userclient,
		storageproxy: storageproxy,
		pathproxy:    pathProxy,
	}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.newRouter())
}
