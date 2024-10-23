package handler

import "net/http"

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	removeAuthCookies(w)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
