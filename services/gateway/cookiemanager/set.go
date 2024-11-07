package cookiemanager

import "net/http"

func Set(w http.ResponseWriter, cookie *http.Cookie) {
	// INSECURE
	cookie.Secure = false

	http.SetCookie(w, cookie)
}
