package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/1001bit/pathgoer/services/email/emailrec"
	"github.com/1001bit/pathgoer/services/email/sender"
)

func main() {
	// email sender
	sender := sender.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ receiver
	rec, err := emailrec.NewReceiver(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	if err != nil {
		log.Fatal(err)
	}
	defer rec.Close()

	msgs, err := rec.Consume()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for msg := range msgs {
			splitted := strings.Split(string(msg.Body), " ")
			email, name, otp := splitted[0], splitted[1], splitted[2]

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			err := sender.SendOtp(ctx, email, name, otp)
			if err != nil {
				log.Println(err)
			}
		}
	}()

	log.Println("Listening for messages")
	<-make(chan struct{})
}
