package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/1001bit/pathgoer/services/email/emailrmq"
	"github.com/1001bit/pathgoer/services/email/sender"
)

func main() {
	// email sender
	sender := sender.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ receiver
	emailRmq, err := emailrmq.New(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	if err != nil {
		log.Fatal(err)
	}
	defer emailRmq.Close()

	go emailRmq.ReadOTP(func(email, name, otp string) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		err := sender.SendOtp(ctx, email, name, otp)
		if err != nil {
			log.Println(err)
		}
	})

	log.Println("Listening for messages")
	<-make(chan struct{})
}
