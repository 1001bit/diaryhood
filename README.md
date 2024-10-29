
[![wakatime](https://wakatime.com/badge/user/c9cde2e7-6a73-45c1-ae59-56a7fc0f5679/project/9367de2a-f41b-4fa0-be3e-ac72ea56ceae.svg)](https://wakatime.com/badge/user/c9cde2e7-6a73-45c1-ae59-56a7fc0f5679/project/9367de2a-f41b-4fa0-be3e-ac72ea56ceae)

# PATHGOER

a productivity app made to gamify process of doing something for a long period of time
## Current Features

- One-time password sign in
- Access JWT + Refresh UUID authN and authZ
## Environment Variables

To run this project, you will need to create your own .env file based on .env.example file

## Run Locally

To run you need docker

Clone the project

```bash
  git clone https://github.com/1001bit/pathgoer
```

Go to the project directory

```bash
  cd pathgoer
```

Build and start

```bash
  make
```

You can see the result on http://localhost:80 after successful start

You can see other commands in the Makefile
## Tech Stack

**Client:** HTML, CSS, Javascript <- Typescript

**Server:** Docker, Golang, PostgreSQL, Redis, gRPC, RabbitMQ etc.


## Documentation

You can read additional docs in `doc` directory

