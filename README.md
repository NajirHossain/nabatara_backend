**Dependencies**

- express
- pg

**DevDependencies**

- nodemon
- dotenv


**Running the App**
```
<!-- build image -->
docker build -t nabataralife-img
<!-- Run image in container. -->
docker compose up -d --build
docker compose --env-file .env.development up --build


Stop container 
docker-compose down