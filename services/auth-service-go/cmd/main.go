package main

import (
	"auth-service-go/internal/handler"
	"auth-service-go/internal/store"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

func main() {
	godotenv.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	connStr := os.Getenv("DB_CONN_STR")
	if connStr == "" {
		log.Fatal("No db connStr provided")
	}

	db, err := store.NewStorage(connStr)
	if err != nil {
		log.Fatal(err)
	}

	h := &handler.AuthHandler{Store: db}
	router := mux.NewRouter()

	router.HandleFunc("/api/v1/auth/register", h.Register).Methods("POST")
	router.HandleFunc("/api/v1/auth/login", h.Login).Methods("POST")
	router.HandleFunc("/api/v1/auth/refresh", h.Refresh).Methods("POST")
	router.HandleFunc("/api/v1/auth/get-new-access-token", h.GetNewAccToken).Methods("POST")

	log.Println("Service running on :3001")
	log.Fatal(http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", port), router))
}
