package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/authpb"
	"github.com/1001bit/pathgoer/services/gateway/grpcclient"
	"github.com/1001bit/pathgoer/services/gateway/router"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
)

func main() {
	// userclient
	conn, err := grpcclient.New(os.Getenv("USER_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	userclient := userpb.NewUserServiceClient(conn)

	// authclient
	conn, err = grpcclient.New(os.Getenv("AUTH_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	authclient := authpb.NewAuthServiceClient(conn)
	log.Println("authclient connected on " + os.Getenv("AUTH_HOST") + ":" + os.Getenv("PORT"))

	// http server
	r := router.New(userclient, authclient)

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
