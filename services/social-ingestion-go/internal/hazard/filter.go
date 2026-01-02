package hazard

import "strings"

var hazards = []string{
	"tsunami",
	"high wave",
	"storm surge",
	"surge",
	"coastal flooding",
}

func Detect(text string) []string {
	text = strings.ToLower(text)
	var found []string

	for _, h := range hazards {
		if strings.Contains(text, h) {
			found = append(found, h)
		}
	}
	return found
}
