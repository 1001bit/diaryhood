[X] Gateway service
[X] Base Home page using templ
[X] Storage service
[X] Build basic layout
[X] User service
    [X] User database
    [X] gRPC server
    [X] Database model
[X] Profile page
    [X] frontend
    [X] gRPC client
[X] Compile typescript

[X] Docs
    [X] Authentication flows
    [X] Readme

[X] Email Service
    [X] Microservice
    [X] RabbitMQ

[X] SignIn/SignUp
    [X] Frontend
        [X] Auth box
        [X] Request send
        [X] Responses handle
        [X] OTP Request send
    [X] Backend
        [X] Login request receive 
        [X] OTP generation and cachying
        [X] OTP send to client
            [X] Email
        [X] Tokens set

[X] Authentication
        [X] AccessJWT Gen
        [X] AccessJWT verify
        [X] RefreshUUID Gen
        [X] Tokens Refresh
        [X] Logout
        [ ] Username change

[X] Shared code
[X] Handle RabbitMQ reconnection
[X] Handle postgres reconnection
[X] Logs
    [X] PLG Stack
    [X] Slog
    [X] More logs and levels
[X] Tests
    [X] Pass interfaces instead of implementations to server
    [X] Email unit test
    [X] user login flow test
        [X] Setup containers and server for test
        [X] Actual tests
        [X] Find and fix a bug during testing

[ ] Path service
    [ ] Use graphQL for path operations