package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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

	app := fiber.New()

	app.Use(cors.New())

	app.Static("/", "./frontend/build")

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Hello, there!")
	})

	app.Get("/getData", func(c *fiber.Ctx) error {
		data, err := readJson(dataFileName)
		if err != nil {
			return c.SendStatus(404)
		}

		var jsonStruct []map[string]interface{}
		json.Unmarshal([]byte(data), &jsonStruct)

		return c.JSON(jsonStruct)
	})

	app.Post("/postData", func(c *fiber.Ctx) error {
		var body PostBody
		json.Unmarshal(c.Body(), &body)

		err := writeJson(dataFileName, body.Data)
		if err != nil {
			return c.SendStatus(404)
		}
		return c.SendStatus(201)
	})

	app.Post("/db-query", func(c *fiber.Ctx) error {
		var body QueryBody
		json.Unmarshal(c.Body(), &body)

		var db *sql.DB
		var err error

		switch body.DbType {
		case "MYSQL":
			db, err = sql.Open("mysql", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.SendStatus(400)
			}
		case "SQLITE":
			db, err = sql.Open("sqlite", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.SendStatus(400)
			}
		}

		defer db.Close()

		_, err = db.Exec(body.Query)
		if err != nil {
			fmt.Println(err)
			return c.SendStatus(400)
		}

		return c.SendStatus(200)
	})

	log.Fatal(app.Listen(":3333"))
}
