package frontend

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed all:build
var BuildFs embed.FS

func BuildHTTPFS() http.FileSystem {
	build, err := fs.Sub(BuildFs, "build")
	if err != nil {
		log.Fatal(err)
	}
	return http.FS(build)
}
