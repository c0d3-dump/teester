build-frontend:
	cd frontend; yarn && yarn build

build-go:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o teester-linux-64
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o teester-windows-64.exe

all: build-frontend build-go