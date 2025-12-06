package main

import (
	"context"
	_ "embed" // IMPT: This allows embedding the file
	"strings"
	"time"
	"unicode"

	"github.com/getlantern/systray"
	"golang.design/x/clipboard"
)

//go:embed favicon.ico
var iconData []byte // Go reads the file and puts the bytes here automatically

// buildCharMapping creates a reverse map: special char -> standard char
func buildCharMapping() map[rune]rune {
	// Define standard char -> special chars it should replace
	replacements := map[rune]string{
		// Lowercase
		'a': "àáâãäåāăąǎǟǡǣȁȃȧɐɑ",
		'b': "ƀɓƃ",
		'c': "çćĉċčƈȼɕ",
		'd': "ďđƌȡɖɗ",
		'e': "èéêëēĕėęěǝȄȆȨɘəɚɛɜɝ",
		'f': "ƒ",
		'g': "ĝğġģǥǧǵɠɡ",
		'h': "ĥħȟɦɧ",
		'i': "ìíîïĩīĭįıǐȉȋɨɩ",
		'j': "ĵǰɉʝ",
		'k': "ķƙǩ",
		'l': "ĺļľŀłƚɫɬɭȴ",
		'm': "ɱ",
		'n': "ñńņňŉŋƞǹɲɳȵ",
		'o': "òóôõöøōŏőơǒǫǭǖȍȎȪȬȮȰɵ",
		'p': "ƥ",
		'q': "ɋʠ",
		'r': "ŕŗřȑȓɍɼɽɾɹɻ",
		's': "śŝşšſșȣʂʃ",
		't': "ţťŧƫƭțȳʈ",
		'u': "ùúûüũūŭůűųưǔǖǘǚǜȕȗʉʊ",
		'v': "ʋʌ",
		'w': "ŵʍ",
		'x': "×",
		'y': "ýÿŷƴȳɏʎɣ",
		'z': "źżžƀƶȥʐʑʒ",

		// Uppercase
		'A': "ÀÁÂÃÄÅĀĂĄǍǞǠȀȂȦ",
		'B': "ƁƂ",
		'C': "ÇĆĈĊČƇȻ",
		'D': "ĎĐƉƊƋ",
		'E': "ÈÉÊËĒĔĖĘĚƎƐȄȆȨ",
		'F': "Ƒ",
		'G': "ĜĞĠĢƓǤǦǴ",
		'H': "ĤĦȞ",
		'I': "ÌÍÎÏĨĪĬĮİƖƗǏȈȊ",
		'J': "ĴɈ",
		'K': "ĶƘǨ",
		'L': "ĹĻĽĿŁȽ",
		'N': "ÑŃŅŇŊƝǸ",
		'O': "ÒÓÔÕÖØŌŎŐƟƠǑǪǬǾȌȎȪȬȮȰ",
		'P': "Ƥ",
		'Q': "Ɋ",
		'R': "ŔŖŘȐȒɌ",
		'S': "ŚŜŞŠȘȢ",
		'T': "ŢŤŦƬƮȚȲ",
		'U': "ÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛȔȖɄ",
		'V': "Ʋ",
		'W': "Ŵ",
		'Y': "ÝŶŸƳȲɎ",
		'Z': "ŹŻŽƵȤ",

		// Numbers
		'0': "⁰₀",
		'1': "¹₁",
		'2': "²₂",
		'3': "³₃",
		'4': "⁴₄",
		'5': "⁵₅",
		'6': "⁶₆",
		'7': "⁷₇",
		'8': "⁸₈",
		'9': "⁹₉",
	}

	// Build reverse mapping: special char -> standard char
	charMap := make(map[rune]rune)

	for standardChar, specialChars := range replacements {
		for _, specialChar := range specialChars {
			charMap[specialChar] = standardChar
		}
	}

	// Add additional special character mappings
	additionalMappings := map[rune]rune{
		// Smart quotes
		'\u201C': '"',  // "
		'\u201D': '"',  // "
		'\u2018': '\'', // '
		'\u2019': '\'', // '
		'\u201E': '"',  // „
		'\u201A': '\'', // ‚
		'\u00AB': '"',  // «
		'\u00BB': '"',  // »

		// Dashes
		'\u2014': '-', // —
		'\u2013': '-', // –
		'\u2010': '-', // ‐
		'\u2011': '-', // ‑
		'\u2212': '-', // −

		// Bullet
		'\u2022': '*', // •

		// Spaces
		'\u00A0': ' ', // NO-BREAK SPACE
		'\u2002': ' ', // EN SPACE
		'\u2003': ' ', // EM SPACE
		'\u2009': ' ', // THIN SPACE

		// Fractions
		'\u00BC': '1', // ¼
		'\u00BD': '1', // ½
		'\u00BE': '3', // ¾

		// Other symbols
		'\u00A7': 'S', // §
		'\u00B5': 'u', // µ
		'\u00AA': 'a', // ª
		'\u00BA': 'o', // º
		'\u00F7': '/', // ÷

		// Zero-width and invisible characters (remove)
		'\u200B': -1, // ZERO WIDTH SPACE
		'\u200C': -1, // ZERO WIDTH NON-JOINER
		'\u200D': -1, // ZERO WIDTH JOINER
		'\uFEFF': -1, // BYTE ORDER MARK
		'\u00AD': -1, // SOFT HYPHEN
	}

	for special, standard := range additionalMappings {
		charMap[special] = standard
	}

	return charMap
}

var charMapping = buildCharMapping()

func main() {
	systray.Run(onReady, onExit)
}

func onReady() {
	// Set the icon in the system tray using the embedded byte slice
	systray.SetIcon(iconData)
	systray.SetTitle("ClipClean")
	systray.SetTooltip("Clipboard Cleaner - Running")

	mStatus := systray.AddMenuItem("✓ Status: Active", "Clipboard cleaner is running")
	mStatus.Disable()
	systray.AddSeparator()

	mAbout := systray.AddMenuItem("About", "Version 1.0 - Cleans special characters from clipboard")
	mAbout.Disable()
	systray.AddSeparator()

	mQuit := systray.AddMenuItem("Quit", "Stop and exit the clipboard cleaner")

	go func() {
		<-mQuit.ClickedCh
		systray.Quit()
	}()

	go startClipboardWatcher()
}

func onExit() {
	// Cleanup code if needed
}

func startClipboardWatcher() {
	err := clipboard.Init()
	if err != nil {
		return
	}

	ch := clipboard.Watch(context.Background(), clipboard.FmtText)

	for data := range ch {
		original := string(data)

		if len(original) == 0 {
			continue
		}

		cleaned := normalizeText(original)

		if cleaned != original {
			time.Sleep(10 * time.Millisecond)
			clipboard.Write(clipboard.FmtText, []byte(cleaned))
		}
	}
}

func normalizeText(input string) string {
	// Step 1: Handle ellipsis (… → ...)
	result := strings.ReplaceAll(input, "\u2026", "...")

	// Step 2: Handle ampersand (& → and)
	result = strings.ReplaceAll(result, "&", " and ")

	// Step 3: Map special characters to standard keyboard characters
	result = strings.Map(func(r rune) rune {
		if replacement, ok := charMapping[r]; ok {
			return replacement
		}
		return r
	}, result)

	// Step 4: Remove non-printable and control characters
	result = strings.Map(func(r rune) rune {
		if unicode.IsGraphic(r) || unicode.IsSpace(r) {
			if unicode.IsControl(r) && r != '\n' && r != '\r' && r != '\t' {
				return -1
			}
			return r
		}
		return -1
	}, result)

	// Step 5: Normalize whitespace (collapse multiple spaces)
	result = normalizeWhitespace(result)

	return result
}

func normalizeWhitespace(s string) string {
	fields := strings.Fields(s)
	return strings.Join(fields, " ")
}