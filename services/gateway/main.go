package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/1001bit/diaryhood/services/gateway/internal/router"
	"github.com/1001bit/overenv"
)

func main() {
	// router
	router, err := router.NewRouter()
	if err != nil {
		log.Fatal("err creating router:", err)
	}

	// start http server
	addr := fmt.Sprintf(":%s", overenv.Get("PORT"))
	log.Println("Listening on", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}
