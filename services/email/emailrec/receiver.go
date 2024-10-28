package emailrec

import (
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

type Receiver struct {
	conn *amqp091.Connection
	ch   *amqp091.Channel
	q    amqp091.Queue
}

func NewReceiver(user, pass, host, port string) (*Receiver, error) {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
	log.Println("connecting to rabbitmq on", connStr)

	conn, err := amqp091.Dial(connStr)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	q, err := declareQueue(ch)
	if err != nil {
		return nil, err
	}

	return &Receiver{
		conn: conn,
		ch:   ch,
		q:    q,
	}, nil
}

func (r *Receiver) Close() {
	r.ch.Close()
	r.conn.Close()
}

func (r *Receiver) Consume() (<-chan amqp091.Delivery, error) {
	return r.ch.Consume(
		r.q.Name, // queue
		"",       // consumer
		false,    // auto-ack
		false,    // exclusive
		false,    // no-local
		false,    // no-wait
		nil,      // args
	)
}

func declareQueue(ch *amqp091.Channel) (amqp091.Queue, error) {
	return ch.QueueDeclare(
		"email", // name
		false,   // durable
		false,   // delete when unused
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
}
