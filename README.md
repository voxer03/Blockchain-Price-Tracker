# Blockchain Price Tracker

## Getting Started
 
1. In the root directory create a file named .env for environment variables 
2. Add the required variables, for refrence you can check the .env.example file.

### Start the Server
To start the server, run the following command:

```bash
docker compose up -d --build
```

## Setup Instructions

Once the server is set up, you have to run commands inside the backend-app Docker container:

```bash
docker exec -it backend-app bash
```
After running the above command, you will have access to the container's terminal. From there, execute the following commands to set up the database:

1. Run database migrations:

```bash
npm run migrate-db
```
2. Seed the database:

```bash
ts-node prisma/seed.ts
```

After running the above commands, the server will start. You can then exit the container's terminal.
- To check logs for the backend-app docker container run:

```bash
docker compose logs backend_app -f
```

### Other Commands

- UP docker-compose for dev to start containers in development mode

```bash
docker compose up -d
```

---

- buid docker-compose for dev to build and start containers in development mode

```bash
docker compose up -d --build
```
- Stop containers which are running in development mode

```bash
docker compose down
```

You can access the Swagger documentation via http://localhost:8200/api