package emailpub

import (
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	conn *amqp091.Connection
}

func NewPublisher(user, pass, host, port string) (*Publisher, error) {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
	log.Println("connecting to rabbitmq on", connStr)

	conn, err := amqp091.Dial(connStr)
	if err != nil {
		return nil, err
	}

	return &Publisher{
		conn: conn,
	}, nil
}

func (p *Publisher) Close() error {
	return p.conn.Close()
}
