package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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

	// cors.Config{
	// 	AllowOrigins: "http://localhost:3000",
	// }

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, there!")
	})

	app.Get("/getData", func(c *fiber.Ctx) error {
		data, err := readJson(dataFileName)
		if err != nil {
			return c.SendStatus(404)
		}

		var jsonStruct []map[string]interface{}
		json.Unmarshal([]byte(data), &jsonStruct)

		fmt.Println(jsonStruct)

		return c.JSON(jsonStruct)
	})

	app.Post("/postData", func(c *fiber.Ctx) error {
		var body PostBody
		json.Unmarshal(c.Body(), &body)

		fmt.Println(body)

		err := writeJson(dataFileName, body.Data)
		if err != nil {
			return c.SendStatus(404)
		}
		return c.SendStatus(201)
	})

	log.Fatal(app.Listen(":3333"))
}
