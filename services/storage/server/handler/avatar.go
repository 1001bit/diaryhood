package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/1001bit/pathgoer/services/storage/shared/accesstoken"
)

const avatarPath = "./storage/dynamic/avatar"

func UploadAvatar(w http.ResponseWriter, r *http.Request) {
	userId := "0"
	if claims, ok := accesstoken.GetClaimsFromContext(r.Context()); !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		userId = claims.Id
	}

	err := r.ParseMultipartForm(5 << 20) // 5MB limit
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get the file from the form
	file, header, err := r.FormFile("avatar")
	if err != nil {
		http.Error(w, "File is missing", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate the file type (basic check by extension)
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif"}
	valid := false
	for _, ext := range allowedExtensions {
		if len(header.Filename) > len(ext) && header.Filename[len(header.Filename)-len(ext):] == ext {
			valid = true
			break
		}
	}
	if !valid {
		http.Error(w, "Invalid file type", http.StatusBadRequest)
		return
	}

	// Save the file
	err = os.MkdirAll(avatarPath, os.ModePerm) // Ensure directory exists
	if err != nil {
		http.Error(w, "Failed to create directory", http.StatusInternalServerError)
		return
	}

	filePath := fmt.Sprintf(avatarPath+"/%s", userId)
	out, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Failed to write file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
