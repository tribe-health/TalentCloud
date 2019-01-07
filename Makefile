# Makefile for Docker Nginx PHP Composer

ROOT=/var/www

build-db:
	@docker exec talentcloud sh -c "php artisan migrate"
	@docker exec talentcloud sh -c "php artisan db:seed"

clean:
	@rm -Rf vendor/
	@rm -Rf composer.lock
	@rm -Rf etc/ssl/*
	@rm -Rf report/*

code-sniff:
	@docker-compose exec -T talentcloud ./vendor/bin/phpcs --config-set ignore_errors_on_exit 1
	@docker-compose exec -T talentcloud ./vendor/bin/phpcs --config-set ignore_warnings_on_exit 1
	@docker-compose exec -T talentcloud ./vendor/bin/phpcs -d memory_limit=512M -v --standard=PSR2 --extensions=php app/

composer-install:
	@docker run --rm -v $(shell pwd):/app composer install

docker-start:
	@docker-compose up -d

docker-stop:
	@docker-compose down

fake-data:
	@docker exec talentcloud sh -c "php artisan db:seed"

fresh-db:
	@docker exec talentcloud sh -c "php artisan migrate:fresh"

gen-certs:
	@docker run --rm -v $(shell pwd)/etc/ssl:/certificates -e "SERVER=talent.local.ca" jacoelho/generate-certificate

laravel-init:
	@docker exec talentcloud sh -c "php artisan key:generate"

logs:
	@docker-compose logs -f

phpmd:
	@docker-compose exec -T talentcloud ./vendor/bin/phpmd ./app \
	html codesize,naming,unusedcode --reportfile report/phpmd.html --ignore-violations-on-exit

phpunit:
	@docker exec talentcloud sh -c "vendor/bin/phpunit --coverage-clover=coverage.xml"

#set-root-perms:
#@docker exec talentcloud sh -c "chgrp -R www-data ${ROOT}/storage/logs ${ROOT}/bootstrap/cache"
#docker exec talentcloud sh -c "chmod -R g+w ${ROOT}/storage/logs ${ROOT}/bootstrap/cache"

test-all: code-sniff phpmd phpunit

.PHONY: build-db clean code-sniff composer-install docker-start docker-stop fake-data fresh-db gen-certs laravel-init logs phpmd phpunit test-all
