[![basebuild](https://github.com/c0d3-dump/teester/actions/workflows/release.yml/badge.svg)](https://github.com/c0d3-dump/teester/actions/workflows/release.yml)

# teester

## small testing utitlity with ui

- supports api and database for testing

### how to run on linux

- downlaod linux binary from [release](https://github.com/c0d3-dump/teester/releases) section
- make binary executable by giving permission on system
- run binary using `./teester-linux-64` in terminal
- now app is running on `http://localhost:3333`

### how to build for your system

#### make sure you have go, make installed

```bash
make all
```

### run app

```bash
./teester-linux-64
```

### app is runnnig on http://localhost:3333

---

## todos:

- [x] : initial application
- [x] : embed frontend with go binary
- [x] : setup routing
- [x] : set header globally and locally
- [x] : only compare response with given body
- [x] : take params and pass in next query
- [x] : show diffs after test run
- [x] : run single test
- [ ] : run all collection
- [ ] : move tests across collections
- [ ] : file uploads
- [ ] : self updatable binary
- [ ] : suggest new ideas
