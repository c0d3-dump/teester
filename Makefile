build-frontend:
	cd frontend; yarn && yarn build

build-go:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o teester-linux-64

all: build-frontend build-go