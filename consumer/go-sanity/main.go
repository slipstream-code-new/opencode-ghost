package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
)

type runtimeCase struct {
	CaseID string `json:"case_id"`
}

type tuiCase struct {
	CaseID string `json:"case_id"`
}

func load(path string, out any) error {
	root, err := os.Getwd()
	if err != nil {
		return err
	}
	body, err := os.ReadFile(filepath.Join(root, "..", "..", path))
	if err != nil {
		return err
	}
	return json.Unmarshal(body, out)
}

func list(dir string) ([]string, error) {
	root, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	items, err := os.ReadDir(filepath.Join(root, "..", "..", dir))
	if err != nil {
		return nil, err
	}
	out := []string{}
	for _, item := range items {
		if item.IsDir() || filepath.Ext(item.Name()) != ".json" {
			continue
		}
		out = append(out, filepath.Join(dir, item.Name()))
	}
	sort.Strings(out)
	return out, nil
}

func main() {
	runtimePaths, err := list("contracts/runtime/cases")
	if err != nil {
		panic(err)
	}
	tuiPaths, err := list("contracts/tui/cases")
	if err != nil {
		panic(err)
	}
	for _, path := range runtimePaths {
		var runtime runtimeCase
		if err := load(path, &runtime); err != nil {
			panic(err)
		}
		if runtime.CaseID == "" {
			panic("go sanity consumer failed to parse runtime case id")
		}
		fmt.Printf("runtime=%s\n", runtime.CaseID)
	}
	for _, path := range tuiPaths {
		var tui tuiCase
		if err := load(path, &tui); err != nil {
			panic(err)
		}
		if tui.CaseID == "" {
			panic("go sanity consumer failed to parse tui case id")
		}
		fmt.Printf("tui=%s\n", tui.CaseID)
	}
}
