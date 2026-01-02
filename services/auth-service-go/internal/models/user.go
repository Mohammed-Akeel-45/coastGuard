package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID       int    `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"user_name"`
	Role     string `json:"user_role"`
	Password string `json:"password"`
}

type Token struct {
	RefreshToken string `json:"refresh_token"`
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"user_role"`
	jwt.RegisteredClaims
}
