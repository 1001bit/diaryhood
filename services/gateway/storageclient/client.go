package storageclient

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type Client struct {
	url *url.URL
}

func MustNew(host, port string) *Client {
	url, err := url.Parse(fmt.Sprintf("http://%s:%s", host, port))
	if err != nil {
		panic(err)
	}

	return &Client{
		url: url,
	}
}

func (c *Client) ReverseProxy() http.HandlerFunc {
	return httputil.NewSingleHostReverseProxy(c.url).ServeHTTP
}
