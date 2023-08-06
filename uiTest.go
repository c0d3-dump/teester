package main

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/input"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
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

func (m *UiProject) CaptureEvents(uiId int) {
	l := launcher.New().Headless(false)
	u := l.MustLaunch()

	browser := rod.New().ControlURL(u).MustConnect().MustIncognito().Trace(true).Sleeper(rod.NotFoundSleeper)

	page := browser.MustPage(m.Config.Host)
	page.MustWindowMaximize().MustWaitStable()

	// TODO: add more events to listen to
	eventQuery := `
		() => {
			document.addEventListener('keydown', (e) => {
				if (['Enter', 'Tab', ' ', 'Backspace', 'Escape', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp'].includes(e.key)) {
					teesterClicked(e.key);
				}
			})

			document.addEventListener('click', 
			(e) => {
				const dialog = document.querySelector('#teesterDialog');
				
				if (!dialog.open) {
					const data = {
						tag: e.target.tagName,
						id: e.target.id,
						class: e.target.classList,
						innerText: e.target.innerText,
						title: e.target.title
					};

					const options = document.querySelectorAll("option.teesterOption");
					for (const option of options) {
						option.remove();
					}

					const selection = document.querySelector("#teesterSelect");

					let option = document.createElement('option');
					option.value = "Nothing";
					option.innerText = "Nothing";
					option.classList.add("teesterOption");
					selection.appendChild(option);

					option = document.createElement('option');
					option.value = data["tag"] + "#" + data["id"];
					option.innerText = "id" + ": " + data["id"];
					option.classList.add("teesterOption");
					selection.appendChild(option);

					for (const selector of ['title', 'innerText']) {
						const option = document.createElement('option');
						option.value = data["tag"] + "[" + selector + "=" + data[selector] + "]";
						option.innerText = selector + ": " + data[selector];
						option.classList.add("teesterOption");
						selection.appendChild(option);
					}

					for (const selector of data.class) {
						const option = document.createElement('option');
						option.value = data["tag"] + "." + selector;
						option.innerText = "class: " + selector;
						option.classList.add("teesterOption");
						selection.appendChild(option);
					}

					dialog.showModal();
				}
			});
		}
	`

	dialog := `
		() => {
			const dialog = document.createElement("dialog");
				dialog.id = "teesterDialog";
				dialog.innerHTML = 
					"<form method='dialog' id='teesterForm'>" +
						"<div style='margin-bottom: 8px;'>" +
							"<select id='teesterSelect' style='width: 100%; background-color: transparent;'>" +
							"</select>" +
						"</div>" +
						"<button type='submit' style='background-color: gray; padding: 2px 8px; border-radius: 8px; display: flex; margin-left: auto;'>Submit</button>" +
					"</form>"
				;

			document.body.appendChild(dialog);

			document.querySelector("#teesterForm").addEventListener('submit', (e) => {
        e.preventDefault();
        const selection = document.querySelector("#teesterSelect");
        const selectedIndex = selection.selectedIndex;
        const selectedOption = selection.options[selectedIndex];
        const selectedValue = selectedOption.value;

				teesterClicked(selectedValue);
				dialog.close();
      });
		}
	`

	page.MustExpose("captureMe", func(v gson.JSON) (interface{}, error) {
		page.MustEval("() => { document.addEventListener('click', (e) => console.log(e)) }")
		page.MustEval(dialog)
		page.MustEval(eventQuery)
		return nil, nil
	})

	page.MustExpose("teesterClicked", func(v gson.JSON) (interface{}, error) {
		fmt.Println(v.Str())
		return nil, nil
	})
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
