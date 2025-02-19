<img style="width:400px;margin auto" src="public/logos/coursemap-banner-light.svg" alt="Large coursemap logo" />

---

Coursemap will be a web app that aims to guide students through the difficulty of choosing courses during university.

The project tracking this repository on Vercel can be found at [this link](https://coursemap-zeta.vercel.app/).
A simple description is below, but the complete documentation can be found [here](https://coursemap-zeta.vercel.app/docs).

## A List of Major Features

Some features to be implemented include:

-   [ ] Informational cards for courses at supported universities
-   [ ] Automatically add all required courses for your program
-   [ ] Visualizing course prerequisites and the possible paths using courses you already have
-   [ ] Organizing courses by semester
-   [ ] Searching and filtering of courses based upon your keywords and attributes
-   [ ] Adding your own courses in case your university is not supported

<details>
  <summary>Check out the Figma concepts here!</summary>
  <img src="public/concepts/demo-course-search.png" alt="A page containing the information for a course"/>
  <img src="public/concepts/demo-course-centric.png" alt="A page visualizing the possible paths forward to a course with various branches"/>
  <img src="public/concepts/demo-semester-centric.png" alt="A page containing vertical columns representing semesters, with a search bar on the side" />
</details>

## Deploying

```
⚠️ Coursemap is still under very active development!
Many of the features mentioned above are still in progress!
```

To deploy Coursemap, you can simply use the following Docker compose file and an .env file:

```yaml
services:
    coursemap:
        image: ghcr.io/allanhechen/coursemap:latest
        environment:
            DEPLOYMENT_TYPE: ${DEPLOYMENT_TYPE:-docker}
            POSTGRES_URL: ${POSTGRES_URL:-postgresql://postgres:password@postgres:5432/postgres}
            AUTH_URL: http://localhost:3000/api/auth
            AUTH_TRUST_HOST: 1
        ports:
            - "3000:3000"
        depends_on:
            - pg_proxy
        env_file:
            - .env
    postgres:
        image: postgres:16.4
        environment:
            POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
        ports:
            - "54320:5432"
        volumes:
            - ./pgdata:/var/lib/postgresql/data
        env_file:
            - .env
    pg_proxy:
        image: ghcr.io/neondatabase/wsproxy:latest
        environment:
            ALLOW_ADDR_REGEX: ".*"
            LOG_TRAFFIC: "true"
        ports:
            - "54330:80"
        depends_on:
            - postgres
```

```bash
DEPLOYMENT_TYPE=docker
POSTGRES_PASSWORD=password
POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres

# generate your own key by running "openssl rand -base64 32"
AUTH_SECRET="your_secret_here"

# add your own app with information from https://github.com/settings/applications/new
# detailed instructions at https://authjs.dev/guides/configuring-github
AUTH_GITHUB_ID="your_id_here"
AUTH_GITHUB_SECRET="your_secret_here"
```

## Configuring the development environment

1. Install [Docker](https://docs.docker.com/get-started/get-docker/)

-   We will be using Docker for a local Postgres database, in addition to routing the database traffic through a proxy to emulate Vercel's serverless environment.

2. Clone this repository

```sh
git clone https://github.com/allanhechen/coursemap.git
cd coursemap
```

3.  Install npm dependencies

```sh
npm i
```

4. Run the development server

```sh
npm run dev
```

5. Head to [port 3000](http://localhost:3000)

## Contributing

Thanks for reading this far into the documentation! This is my first open source project, so don't be intimidated to help!

Coursemap is built mainly using Next.js and Postgres, with Docker as an option to avoid setting up Vercel's serverless environment.

To get started, follow the instructions 1-3 above but run `npm run dev` as the last command.

I am doing my best to document all of my decisions and the logic behind the code, extensive docs can be found [here](https://coursemap-zeta.vercel.app/docs).

## License

Coursemap is licensed with [AGPL-3](LICENSE).
