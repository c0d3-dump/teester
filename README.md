# teester

## small testing utitlity with ui

- supports api and database for testing

### how to run on linux

* downlaod linux binary from [release](https://github.com/c0d3-dump/teester/releases) section
* make binary executable by giving permission on system
* run binary using `./teester-linux-64` in terminal
* now app is running on `http://localhost:3333`

### how to build for your system

#### make sure you have go installed

```bash
cd frontend

yarn
yarn build

CGO_ENABLED=0 go build -o teester
```

### run app

```bash
./teester
```

### app is runnnig on http://localhost:3333
