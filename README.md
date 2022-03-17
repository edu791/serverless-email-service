# Serverless Mail Service For Sengrid

## Install dependencies
```sh
npm install -g serverless
npm install
```

## Local environment variables
* Create a `.env.yml` file on the root of the project.
The content should be like this:

```
EMAIL_API_KEY: G2M3N3KJ4HG23KJ4HG23J4
FROM_EMAIL: hello@mycompany.com
FROM_NAME: No-reply
```

Note: I recommend you to use a service like [Doppler](https://www.doppler.com) to store your environment variables. It's used on the CI/CD scripts inside the `.github/workflow` folder

## Run offline server

* Copy `config.example.yml` to `config.dev.yml` and `config.prod.yml`, then set up the values properly for every environment.

* Start the server
```sh
npm run offline
```

* Go to http://localhost:3000
