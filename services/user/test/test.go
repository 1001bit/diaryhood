package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitemail"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func testServer(t *testing.T, ctx context.Context, server *server.Server, emailChan <-chan *rabbitemail.EmailBody) {
	respEmail := ""
	t.Run("Request otp email", func(t *testing.T) {
		// Send Bad Login
		_, err := server.SendOtpEmail(ctx, &userpb.SendOtpEmailRequest{Login: "unknown"})
		if status.Code(err) != codes.NotFound {
			t.Fatal(err)
		}

		// Send Good Login
		resp, err := server.SendOtpEmail(ctx, &userpb.SendOtpEmailRequest{Login: "good@email.com"})
		if err != nil {
			t.Fatal(err)
		}
		respEmail = resp.Email
	})

	emailOtp := ""
	t.Run("receive email", func(t *testing.T) {
		// Wait for email
		emailBody := <-emailChan
		if respEmail != emailBody.Email {
			t.Fatalf("expected %s, but got %s", respEmail, emailBody.Email)
		}
		emailOtp = emailBody.Otp
	})

	var tokens *userpb.TokensResponse = nil
	t.Run("login with otp", func(t *testing.T) {
		// Bad inputs
		_, err := server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
			Email: "bad@email.com",
			Otp:   emailOtp,
		})
		if status.Code(err) != codes.NotFound {
			t.Fatal("expected not found, but got:", err)
		}

		_, err = server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
			Email: respEmail,
			Otp:   "wrongotp",
		})
		if status.Code(err) != codes.NotFound {
			t.Fatal("expected not found, but got:", err)
		}

		// Good input
		tokens, err = server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
			Email: respEmail,
			Otp:   emailOtp,
		})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}
	})

	claims, ok := accesstoken.ExtractClaims(tokens.AccessJWT)
	if !ok {
		t.Fatal("expected OK, but not OK")
	}

	t.Run("get profile", func(t *testing.T) {
		profile, err := server.GetProfile(ctx, &userpb.GetProfileRequest{Id: claims.Id})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}

		t.Log("date:", profile.Date)
	})

	t.Run("change username", func(t *testing.T) {
		_, err := server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, NewName: "bad name"})
		if status.Code(err) != codes.InvalidArgument {
			t.Fatal("expected InvalidArgument, but got:", err)
		}

		_, err = server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, NewName: "toolongname111111111111111111111111111111"})
		if status.Code(err) != codes.InvalidArgument {
			t.Fatal("expected InvalidArgument, but got:", err)
		}

		_, err = server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, NewName: "newname"})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}
	})

	t.Run("get profile", func(t *testing.T) {
		profile, err := server.GetProfile(ctx, &userpb.GetProfileRequest{Id: claims.Id})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}

		if profile.Name != "newname" {
			t.Fatal("expected newname, but got:", profile.Name)
		}
	})

	t.Run("refresh tokens", func(t *testing.T) {
		var err error
		tokens, err = server.RefreshTokens(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}
	})

	t.Run("logout", func(t *testing.T) {
		_, err := server.Logout(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
		if err != nil {
			t.Fatal("expected OK, but got:", err)
		}
	})

	t.Run("refresh tokens", func(t *testing.T) {
		var err error
		tokens, err = server.RefreshTokens(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
		if status.Code(err) != codes.Unauthenticated {
			t.Fatal("expected unauthenticated, but got:", err)
		}
	})
}
