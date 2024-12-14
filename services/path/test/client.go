package test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server/handler"
)

type HTTPClient struct {
	jwt  string
	addr string
}

func NewHTTPClient(addr string) *HTTPClient {
	return &HTTPClient{
		jwt:  "",
		addr: addr,
	}
}

func (c *HTTPClient) SetJWT(token string) {
	c.jwt = token
}

func (c *HTTPClient) MakeRequest(ctx context.Context, method string, url string, body any) (int, []byte, error) {
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return 0, nil, err
	}

	req, err := http.NewRequest(method, c.addr+url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return 0, nil, err
	}
	// TODO: Add "bearer" before token
	req = req.WithContext(ctx)
	req.Header.Set("Authorization", c.jwt)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer res.Body.Close()

	bodyBytes, err = io.ReadAll(res.Body)
	if err != nil {
		return 0, nil, err
	}

	return res.StatusCode, bodyBytes, err
}

func (c *HTTPClient) CreatePath(ctx context.Context, body handler.CreatePathRequest) (int, error) {
	code, _, err := c.MakeRequest(ctx, "POST", "/", body)
	return code, err
}

func (c *HTTPClient) FetchUserPaths(ctx context.Context, userId string) (int, []*pathmodel.Path, error) {
	code, body, err := c.MakeRequest(ctx, "GET", "/user/"+userId, nil)
	if err != nil {
		return code, nil, err
	}

	paths := []*pathmodel.Path{}
	if err := json.Unmarshal(body, &paths); err != nil {
		return 0, nil, err
	}

	return code, paths, nil
}

func (c *HTTPClient) FetchPath(ctx context.Context, pathId string) (int, *handler.PathResponse, error) {
	code, body, err := c.MakeRequest(ctx, "GET", "/"+pathId, nil)
	if err != nil {
		return code, nil, err
	}

	path := &handler.PathResponse{}
	if err := json.Unmarshal(body, path); err != nil {
		return 0, nil, err
	}

	return code, path, nil
}
