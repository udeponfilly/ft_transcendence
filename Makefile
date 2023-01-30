# VARIABLES

COMPOSE=docker-compose -p transcendance

# GENERAL RULES

all: build up

re: fclean all

# DOCKER RULES

build:
	${COMPOSE} build

up:
	${COMPOSE} up

stop:
	${COMPOSE} stop

# CLEAN RULES

fclean: clean prune

clean:
	${COMPOSE} down

volume_rm:
	docker volume rm transcendance_db-volume

prune:
	docker system prune -a --force
	docker volume prune --force
	docker network prune --force

test:
	@bash ./unit-test/unit-test.sh

.PHONY: all re build up stop clean fclean volume_rm prune

