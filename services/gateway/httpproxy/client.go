package httpproxy

import (
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type Proxy struct {
	url *url.URL
}

func New(addr string) (*Proxy, error) {
	url, err := url.Parse(addr)
	if err != nil {
		slog.With("err", err).Error("Failed to parse url")
		return nil, err
	}

	return &Proxy{
		url: url,
	}, nil
}

func (c *Proxy) ReverseProxy() http.HandlerFunc {
	return httputil.NewSingleHostReverseProxy(c.url).ServeHTTP
}
