package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/storage/router"
)

func main() {
	r := router.New()

	addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
