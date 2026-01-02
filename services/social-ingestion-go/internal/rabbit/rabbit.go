package rabbit

import (
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	ch *amqp.Channel
}

func New(url string) *Publisher {
	conn, err := amqp.Dial(url)
	if err != nil {
		log.Fatal(err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}

	_, err = ch.QueueDeclare(
		"reports",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal(err)
	}

	return &Publisher{ch: ch}
}

func (p *Publisher) Publish(msg any) error {
	body, _ := json.Marshal(msg)
	return p.ch.Publish(
		"",
		"reports",
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		},
	)
}
