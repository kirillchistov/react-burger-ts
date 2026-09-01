.PHONY: help dev build lint eslint stylelint prettier commit test install clean

help:
	@echo "Available commands:"
	@echo "  make dev           - Start the development server"
	@echo "  make build         - Build for production"
	@echo "  make lint          - Run all linters (eslint, stylelint, prettier)"
	@echo "  make eslint        - Run ESLint and fix issues"
	@echo "  make stylelint     - Run stylelint and fix issues"
	@echo "  make prettier      - Run Prettier and format code"
	@echo "  make commit        - Create a conventional commit"
	@echo "  make test          - Run tests"
	@echo "  make test-ui       - Run tests with UI"
	@echo "  make e2e           - Run E2E tests"
	@echo "  make e2e-ui        - Run E2E tests with UI"
	@echo "  make install       - Install dependencies"
	@echo "  make clean         - Remove build artifacts"

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

eslint:
	npm run eslint

stylelint:
	npm run stylelint

prettier:
	npm run prettier

commit:
	npm run commit

test:
	npm run test

test-ui:
	npm run test:ui

e2e:
	npm run e2e

e2e-ui:
	npm run e2e:ui

install:
	npm install

clean:
	rm -rf dist node_modules .vite
