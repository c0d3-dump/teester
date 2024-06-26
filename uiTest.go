package main

import (
	"regexp"
	"strconv"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
)

type Uis struct {
	Selector string `json:"selector"`
	Input    string `json:"input"`
	Event    string `json:"event"`
}

type ConfigStruct struct {
	Host string `json:"host"`
}

type UiProject struct {
	Config ConfigStruct `json:"config"`
	Uis    []UiTest     `json:"uis"`
}

type UiTest struct {
	Name        string `json:"name"`
	Screenshots bool   `json:"screenshots"`
	Data        []Uis  `json:"data"`
}

func (m *UiProject) initBrowser() {
	l := launcher.New().Headless(false)
	l.MustLaunch()
}

func (m *UiProject) Run(uiId int) {
	l := launcher.New().Headless(false)
	u := l.MustLaunch()

	browser := rod.New().ControlURL(u).MustConnect().MustIncognito().Trace(true).Sleeper(rod.NotFoundSleeper)
	defer browser.MustClose()

	page := browser.MustPage(m.Config.Host)
	page.MustWindowMaximize().MustWaitStable()

	ui := m.Uis[uiId]
	if ui.Screenshots {
		page.MustScreenshot("screenshots/base.png")
	}

	for i, t := range ui.Data {
		RunTest(page, &t)

		page.MustWaitStable()
		if ui.Screenshots {
			page.MustScreenshot("screenshots/" + strconv.Itoa(i) + ".png")
		}
	}

	browser.MustClose()
}

func RunTest(page *rod.Page, test *Uis) {
	var el *rod.Element
	if test.Selector != "" {
		el = page.MustElement(test.Selector)
	}

	if test.Input != "" || test.Event != "Wait" {
		fakeData := FakeData(test.Input)
		if fakeData == "" {
			el.MustInput(test.Input)
		} else {
			el.MustInput(fakeData)
		}
	}

	switch test.Event {
	case "Nothing":
		// do nothing!
	case "LeftMouseClick":
		el.MustClick()
	case "RightMouseClick":
		err := el.Click(proto.InputMouseButtonRight, 1)
		if err != nil {
			panic(err)
		}
	case "Enter":
		page.KeyActions().Press(input.Enter).MustDo()
	case "Tab":
		page.KeyActions().Press(input.Tab).MustDo()
	case "Space":
		page.KeyActions().Press(input.Space).MustDo()
	case "Backspace":
		page.KeyActions().Press(input.Backspace).MustDo()
	case "Esc":
		page.KeyActions().Press(input.Escape).MustDo()
	case "PgDown":
		page.KeyActions().Press(input.PageDown).MustDo()
	case "PgUp":
		page.KeyActions().Press(input.PageUp).MustDo()
	case "ArrowUp":
		page.KeyActions().Press(input.ArrowUp).MustDo()
	case "ArrowDown":
		page.KeyActions().Press(input.ArrowDown).MustDo()
	case "ArrowLeft":
		page.KeyActions().Press(input.ArrowLeft).MustDo()
	case "ArrowRight":
		page.KeyActions().Press(input.ArrowRight).MustDo()
	}
}

func FakeData(input string) string {
	pattern := "\\${(.*?)}"

	re := regexp.MustCompile(pattern)
	match := re.FindStringSubmatch(input)

	if len(match) > 1 {
		switch match[1] {
		case "Email":
			return gofakeit.Email()
		case "Name":
			return gofakeit.Name()
		case "Phone":
			return gofakeit.Phone()
		case "Color":
			return gofakeit.Color()
		case "Company":
			return gofakeit.Company()
		case "HackerPhrase":
			return gofakeit.HackerPhrase()
		case "CurrencyShort":
			return gofakeit.CurrencyShort()
		case "Sentence":
			return gofakeit.Sentence(99)
		case "Number":
			return strconv.Itoa(gofakeit.Number(1, 50))
		case "BeerName":
			return gofakeit.BeerName()
		case "UUID":
			return gofakeit.UUID()
		case "URL":
			return gofakeit.URL()
		case "Emoji":
			return gofakeit.Emoji()
		case "Date":
			return gofakeit.Date().Format("2006-01-02 15:04:05")
		}
	}
	return ""
}
