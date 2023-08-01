package main

import (
	"strconv"
	"time"

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

	time.Sleep(time.Second)
	browser.MustClose()
}

func RunTest(page *rod.Page, test *Uis) {
	var el *rod.Element
	if test.Selector != "" {
		el = page.MustElement(test.Selector)
	}

	if test.Input != "" {
		el.MustInput(test.Input)
	}

	switch test.Event {
	case "Nothing":
		// do nothing!
	case "Wait":
		duration, err := strconv.Atoi(test.Input)
		if err != nil {
			panic(err)
		}
		page.WaitIdle(time.Second * time.Duration(duration))
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
	}
}
