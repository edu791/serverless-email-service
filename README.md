# Serverless Mail Service For Sengrid

## Install dependencies
```sh
npm i
```

## Run offline server

* Copy `config.example.yml` to `config.dev.yml` and `config.prod.yml`, then set up the values properly for every environment.

* Start the server
```sh
npm run offline
```
Note: Offline server will run using the `config.dev.yml` environment file by default.

* Go to http://localhost:3000
