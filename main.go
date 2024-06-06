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

type RunUiBody struct {
	ProjectId int `json:"projectId"`
	UiId      int `json:"uiId"`
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

	app.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3333", "*"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowMethods:     []string{echo.GET, echo.POST},
		AllowCredentials: true,
	}))

	app.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Filesystem: frontend.BuildHTTPFS(),
		HTML5:      true,
	}))

	app.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello there!")
	})

	app.POST("/init-browser", func(c echo.Context) error {
		var uiTestData UiProject
		uiTestData.initBrowser()

		var jsonStruct []map[string]interface{}
		return c.JSON(http.StatusOK, jsonStruct)
	})

	app.GET("/getData", func(c echo.Context) error {
		data, err := readJson(dataFileName)
		if err != nil {
			return c.String(http.StatusBadRequest, err.Error())
		}

		var jsonStruct []map[string]interface{}
		json.Unmarshal([]byte(data), &jsonStruct)

		return c.JSON(http.StatusOK, jsonStruct)
	})

	app.POST("/postData", func(c echo.Context) error {
		body := new(PostBody)
		err := c.Bind(body)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, err.Error())
		}

		err = writeJson(dataFileName, body.Data)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, err.Error())
		}
		return c.String(http.StatusCreated, "")
	})

	app.POST("/db-query", func(c echo.Context) error {
		var err error

		body := new(QueryBody)
		err = c.Bind(body)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, err.Error())
		}

		var db *sql.DB

		switch body.DbType {
		case "MYSQL":
			db, err = sql.Open("mysql", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.String(http.StatusBadRequest, err.Error())
			}
		case "SQLITE":
			db, err = sql.Open("sqlite", body.DbUrl)
			if err != nil {
				fmt.Println(err)
				return c.String(http.StatusBadRequest, err.Error())
			}
		}

		defer db.Close()

		var rows *sql.Rows
		rows, err = db.Query(body.Query)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, err.Error())
		}

		data := make([]map[string]interface{}, 0)

		columns, err := rows.Columns()
		if err != nil {
			return c.String(http.StatusBadRequest, err.Error())
		}

		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))

		for rows.Next() {
			for i := range columns {
				valuePtrs[i] = &values[i]
			}

			if err := rows.Scan(valuePtrs...); err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			entry := make(map[string]interface{})
			for i, column := range columns {
				var v interface{}
				val := values[i]

				b, ok := val.([]byte)
				if ok {
					v = string(b)
				} else {
					v = val
				}

				entry[column] = v
			}

			data = append(data, entry)
		}

		if err := rows.Err(); err != nil {
			return c.String(http.StatusBadRequest, err.Error())
		}

		return c.JSON(http.StatusOK, data)
	})

	app.POST("/run-ui-test", func(c echo.Context) error {
		var err error

		body := new(RunUiBody)
		err = c.Bind(body)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusBadRequest, err.Error())
		}

		data, err := readJson(dataFileName)
		if err != nil {
			return c.String(http.StatusBadRequest, err.Error())
		}

		var jsonStruct []map[string]interface{}
		json.Unmarshal([]byte(data), &jsonStruct)

		var uiTestData UiProject
		tempData := jsonStruct[body.ProjectId]

		temporaryVariable, _ := json.Marshal(tempData)
		_ = json.Unmarshal(temporaryVariable, &uiTestData)

		uiTestData.Run(body.UiId)

		return c.NoContent(http.StatusOK)
	})

	// go openbrowser("http://localhost:3333")
	log.Fatal(app.Start(":3333"))
}
