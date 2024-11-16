package test

import (
	"context"
	"strings"
	"testing"

	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/shared/accesstoken"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitemail"
	"github.com/1001bit/pathgoer/services/user/shared/userpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func testServer(t *testing.T, ctx context.Context, server *server.Server, emailChan <-chan *rabbitemail.EmailBody) {
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

	// Catch emailBody from Consumer
	emailBody := <-emailChan
	if resp.Email != emailBody.Email {
		t.Fatal("bad email:", emailBody, resp.Email)
	}

	// Login with OTP from emailBody
	// Bad inputs
	_, err = server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
		Email: "bad@email.com",
		Otp:   emailBody.Otp,
	})
	if status.Code(err) != codes.NotFound {
		t.Fatal("expected not found, but got:", err)
	}

	_, err = server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
		Email: emailBody.Email,
		Otp:   "wrongotp",
	})
	if status.Code(err) != codes.NotFound {
		t.Fatal("expected not found, but got:", err)
	}

	// Good input
	tokens, err := server.VerifyOtp(ctx, &userpb.VerifyOtpRequest{
		Email: emailBody.Email,
		Otp:   emailBody.Otp,
	})
	if err != nil {
		t.Fatal("expected OK, but got:", err)
	}

	// Get profile
	claims, ok := accesstoken.ExtractClaims(tokens.AccessJWT)
	if !ok {
		t.Fatal("expected OK, but not OK")
	}
	profile, err := server.GetProfile(ctx, &userpb.GetProfileRequest{Name: strings.ToUpper(claims.Name)})
	if err != nil {
		t.Fatal("expected OK, but got:", err)
	}

	if profile.Name != claims.Name {
		t.Fatal("expected another name:", claims.Name, profile.Name)
	}

	t.Log("date:", profile.Date)

	// Rename user
	_, err = server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, OldName: claims.Name, NewName: "bad name"})
	if status.Code(err) != codes.InvalidArgument {
		t.Fatal("expected InvalidArgument, but got:", err)
	}

	_, err = server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, OldName: claims.Name, NewName: "toolongname111111111111111111111111111111"})
	if status.Code(err) != codes.InvalidArgument {
		t.Fatal("expected InvalidArgument, but got:", err)
	}

	_, err = server.ChangeUsername(ctx, &userpb.ChangeUsernameRequest{Id: claims.Id, OldName: claims.Name, NewName: "newname"})
	if err != nil {
		t.Fatal("expected OK, but got:", err)
	}

	// Refresh the tokens
	tokens, err = server.RefreshTokens(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
	if err != nil {
		t.Fatal("expected OK, but got:", err)
	}

	// Logout
	_, err = server.Logout(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
	if err != nil {
		t.Fatal("expected OK, but got:", err)
	}

	// Try to refresh
	tokens, err = server.RefreshTokens(ctx, &userpb.RefreshTokenRequest{RefreshUUID: tokens.RefreshUUID})
	if status.Code(err) != codes.Unauthenticated {
		t.Fatal("expected unauthenticated, but got:", err)
	}
}
