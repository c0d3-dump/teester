# teester

## small testing utitlity with ui

- supports api and database for testing

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
