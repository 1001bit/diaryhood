package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/authclient"
	"github.com/1001bit/pathgoer/services/gateway/router"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
)

func main() {
	// userclient
	userclient, err := userclient.New(os.Getenv("USER_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}

	// authclient
	authclient, err := authclient.New(os.Getenv("AUTH_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}

	// http server
	r := router.New(userclient, authclient)

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
