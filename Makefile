.PHONY: setup seed train up down test clean help

python := python

help:
	@echo "LASA Guard Management Commands:"
	@echo "  make setup   - Install dependencies from requirements.txt"
	@echo "  make seed    - Seed MongoDB / local store with drugs and LASA pairs"
	@echo "  make train   - Train all ML models, save metrics and PCA visualization plot"
	@echo "  make up      - Spin up microservices using docker-compose up"
	@echo "  make down    - Terminate docker-compose containers"
	@echo "  make test    - Run pytest test suite"
	@echo "  make clean   - Remove cached files and trained artifacts"

setup:
	$(python) -m pip install -r requirements.txt

seed:
	PYTHONPATH=. $(python) backend/scripts/seed_drugs.py

train:
	PYTHONPATH=. $(python) backend/scripts/train_all_models.py

up:
	docker-compose up --build -d

down:
	docker-compose down -v

test:
	PYTHONPATH=. pytest tests/ -v

clean:
	rm -rf models_saved/*.pkl models_saved/*.h5 models_saved/*.png models_saved/*.json
	find . -type d -name "__pycache__" -exec rm -rf {} +
