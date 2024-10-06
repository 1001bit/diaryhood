package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/gateway/router"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
)

func main() {
	userclient := userclient.MustNew(os.Getenv("USER_HOST"), os.Getenv("PORT"))

	r := router.New(userclient)

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
