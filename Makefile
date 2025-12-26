.PHONY: install dev build preview clean pdf

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

clean:
	rm -rf node_modules dist

pdf: build
	npm run pdf
