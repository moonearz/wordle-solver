PROJECT := $(notdir $(CURDIR))
VENV := $(HOME)/.venvs/$(PROJECT)

PYTHON := $(VENV)/bin/python
PIP := $(PYTHON) -m pip
PREK := $(VENV)/bin/prek

.PHONY: setup check update-rankings

setup:
	python3.13 -m venv $(VENV)
	$(PIP) install -e ".[dev]"
	$(PREK) install

check:
	$(PREK) run --all-files

update-rankings:
	$(PYTHON) scripts/update_rankings.py
