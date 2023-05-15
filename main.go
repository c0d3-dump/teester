package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"main/frontend"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "modernc.org/sqlite"
)

func readJson(filename string) (string, error) {
	bytes, err := os.ReadFile(filename)
	if err != nil {
		fmt.Println(err)
	}

	return string(bytes[:]), err
}

func writeJson(filename string, data string) error {
	err := os.WriteFile(filename, []byte(data), fs.ModePerm)
	if err != nil {
		fmt.Println(err)
	}

	return err
}

type PostBody struct {
	Data string `json:"data"`
}

type QueryBody struct {
	DbType string `json:"dbType"`
	DbUrl  string `json:"dbUrl"`
	Query  string `json:"query"`
}

func fileCheck(filename string) error {
	conn, err := os.Open(filename)
	if err != nil {
		fmt.Println("data.json does not exists!")
		conn, err := os.Create(filename)
		conn.WriteString("[]")
		conn.Close()
		return err
	}
	conn.Close()
	return nil
}

func main() {
	dataFileName := "data.json"
	err := fileCheck(dataFileName)
	if err != nil {
		fmt.Println("unable to create file!")
		return
	}

	app := echo.New()

	app.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Filesystem: frontend.BuildHTTPFS(),
		HTML5:      true,
	}))

	app.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello there!")
	})

	app.GET("/getData", func(c echo.Context) error {
		data, err := readJson(dataFileName)
		if err != nil {
			return c.String(http.StatusBadRequest, "")
		}

		var jsonStruct []map[string]interface{}
		json.Unmarshal([]byte(data), &jsonStruct)

		return c.JSON(http.StatusOK, jsonStruct)
	})

	app.POST("/postData", func(c echo.Context) error {
		body := new(PostBody)
		err := c.Bind(body)
		if err != nil {
			return c.String(http.StatusBadRequest, "")
		}

		err = writeJson(dataFileName, body.Data)
		if err != nil {
			return c.String(http.StatusBadRequest, "")
		}
		return c.String(http.StatusCreated, "")
	})

	app.POST("/db-query", func(c echo.Context) error {
		var err error

		body := new(QueryBody)
		err = c.Bind(body)
		if err != nil {
			return c.String(http.StatusBadRequest, "")
		}

		var db *sql.DB

		switch body.DbType {
		case "MYSQL":
			db, err = sql.Open("mysql", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.String(http.StatusBadRequest, "")
			}
		case "SQLITE":
			db, err = sql.Open("sqlite", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.String(http.StatusBadRequest, "")
			}
		}

		defer db.Close()

		_, err = db.Exec(body.Query)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, "")
		}

		return c.String(http.StatusOK, "")
	})

	log.Fatal(app.Start(":3333"))
}
