setup:
	cargo init

install:
	cargo install sqlx-cli --no-default-features --features postgres

deps:
	cargo add actix-web actix-web-lab actix-http chrono futures-util futures actix-cors jsonwebtoken config regex rand reqwest anyhow env_logger log serde_json sha2 md5 cbc base64 dotenvy validator && \
	cargo add uuid --features "v4 fast-rng macro-diagnostics" && \
	cargo add serde --features "derive" && \
	cargo add sea-orm --features "sqlx-postgres runtime-tokio-rustls macros"

dev-start:
	podman-compose -f docker-compose.yaml up -d

dev-down:
	podman-compose -f docker-compose.yaml down -v && \
	podman rmi -a && \
	podman volume prune -f

dev-stop:
	podman-compose -f docker-compose.yaml stop

dev-logs:
	podman-compose -f docker-compose.yaml logs

dev-logs-real:
	podman-compose -f docker-compose.yaml logs -f

dev-status:
	podman-compose -f docker-compose.yaml ps

prod-start:
	podman-compose -f prod.docker-compose.yaml up -d

postgres-ip:
	podman inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres

gen-seaorm-entity:
	sea-orm-cli generate entity -o entity/src

dev-run:
	cargo watch -c -w src -x run