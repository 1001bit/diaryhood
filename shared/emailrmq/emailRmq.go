package emailrmq

import (
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

type EmailRmq struct {
	conn *amqp091.Connection
	ch   *amqp091.Channel
	q    amqp091.Queue
}

func New(user, pass, host, port string) (*EmailRmq, error) {
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

	q, err := declareEmailQueue(ch)
	if err != nil {
		return nil, err
	}

	return &EmailRmq{
		conn: conn,
		ch:   ch,
		q:    q,
	}, nil
}

func (rmq *EmailRmq) Close() {
	rmq.ch.Close()
	rmq.conn.Close()
}

func declareEmailQueue(ch *amqp091.Channel) (amqp091.Queue, error) {
	return ch.QueueDeclare(
		"email", // name
		false,   // durable
		false,   // delete when unused
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
}
