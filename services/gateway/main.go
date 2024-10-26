package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/grpcclient"
	"github.com/1001bit/pathgoer/services/gateway/router"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

func main() {
	// userclient
	conn, err := grpcclient.New("user", os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	userclient := userpb.NewUserServiceClient(conn)

	// http server
	r := router.New(userclient)

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
