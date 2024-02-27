# Virta Assigment

First of all, thank you for this opportunity. I would like to say before you start looking in the code that I know the lack of e2e tests and that the error handling could be done better. Unfortunately, this is not a 3-4-hour project and I can't spend too much time on this assignment.
Even so, there are things that can be done better, I would love to have a meeting to talk about it.

## Testing

### Unit tests

To run unit tests, run the following command:

```cmd
pnpm run test
```

### Integration tests

To run integration tests, run the following command:

```cmd
pnpm run test:int
```

## Build & Run

1. Build all the apps with the following command:

```cmd
pnpm run build
```

2. Once built, you can use the docker-compose to start the project.

```cmd
docker compose up
```