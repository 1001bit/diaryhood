
[![wakatime](https://wakatime.com/badge/github/1001bit/pathgoer.svg)](https://wakatime.com/badge/github/1001bit/pathgoer)

# PATHGOER

a productivity app made to gamify process of doing something for a long period of time
## Current Features

- One-time password sign in
- Access JWT + Refresh UUID authN and authZ
- Paths creation for each user
- Stats creation for each path
- Quota for each stat
- Dynamic file storage, profile picture

## Environment Variables

To run this project, you will need to create your own `.env` file based on `.env.example` file.

There are variables like: credentials to services, ports, secrets, keys etc.

Specifically, you want to set:

`MG_API_KEY`: Mailgun API key

`MG_DOMAIN`: Mailgun domain

## Run Locally

To run you need **docker** and **docker compose**

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

## Testing

**User service**: run `make test-user`

**Path service**: run `make test-path`

## Directories

`config`: config files for some services

`doc`: additional docs

`protobuf`: protobuf files for gRPC servers

`services`: services, their servers

`shared`: golang code, shared between services

`sql`: init sql scripts for databases

`static`: static storage for css, js, etc.

`typescript`: typescript code to be compiled into `static`

## Editing typescript, protobuf, templ, shared code

After editing one of this you can do `make gencopy` or `make` (both of them do all the stuff described later), but specifically:

`make tscompile` **---** `.ts` files inside `typescript` directory are compiled to `static` directory according to their tsconfigs (python and typescript compiler required)

`make protoc` **---** `.proto` files inside `protobuf` directory are compiled to `services/*service*/shared` directory (golang protoc required)

`make templ` **---** `.templ` files inside `services/gateway/template` directory are compiled in the same directory (golang templ compiler required)

`make copyshared` **---** `.go` files inside `shared` directory are copied to `services/*service*/shared` directory (python required)

## Tech Stack

**Client:** HTML, CSS, Javascript <- Typescript

**Server:** Docker, Golang + Many other libs used, PostgreSQL, Redis, gRPC, HTTP, RabbitMQ etc.

## Additional Docs

Can be found in `doc` directory

