.PHONY: install dev build preview clean pdf skills skills-full

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

skills:
	npm run skill:graph

skills-full:
	OPENAI_API_KEY=$${OPENAI_API_KEY} npm run experience:skills
	OPENAI_API_KEY=$${OPENAI_API_KEY} npm run skill:graph
