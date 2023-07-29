package main

import (
	"strconv"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/proto"
)

type RodEvent uint8

const (
	Nothing RodEvent = iota
	Wait
	LeftMouseClick
	RightMouseClick
	Enter
	Tab
	Space
	Ctrl
	Alt
)

type TestRod struct {
	Selector string   `json:"selector"`
	Input    string   `json:"input"`
	Event    RodEvent `json:"event"`
}

type Main struct {
	Url         string    `json:"url"`
	ShowBrowser bool      `json:"showBrowser"`
	Screenshots bool      `json:"screenshots"`
	Tests       []TestRod `json:"tests"`
}

func (m *Main) Run() {
	browser := rod.New().MustConnect().MustIncognito().Trace(true).Sleeper(rod.NotFoundSleeper)
	defer browser.MustClose()

	page := browser.MustPage(m.Url)
	page.MustWindowMaximize().MustWaitStable().MustScreenshot("screenshots/base.png")

	for i, t := range m.Tests {
		RunTest(page, &t, &i)
	}

	time.Sleep(time.Second)
	browser.Close()
}

func RunTest(page *rod.Page, test *TestRod, idx *int) {
	var el *rod.Element
	if test.Selector != "" {
		el = page.MustElement(test.Selector)
	}

	if test.Input != "" {
		el.MustInput(test.Input)
	}

	switch test.Event {
	case Nothing:
		// do nothing!
	case Wait:
		duration, err := strconv.Atoi(test.Input)
		if err != nil {
			panic(err)
		}
		page.WaitIdle(time.Second * time.Duration(duration))
	case LeftMouseClick:
		el.MustClick()
	case RightMouseClick:
		err := el.Click(proto.InputMouseButtonRight, 1)
		if err != nil {
			panic(err)
		}
	case Enter:
		page.KeyActions().Press(input.Enter).MustDo()
	}

	page.MustWaitStable().MustScreenshot("screenshots/" + strconv.Itoa(*idx) + ".png")
}
