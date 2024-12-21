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
        [X] Username change
        [X] Test

[X] Shared code
[X] Handle RabbitMQ reconnection
[X] Handle postgres reconnection
[X] Logs
    [X] PLG Stack
    [X] Slog

[X] Profile page
    [X] Dummy layout
    [X] Use templ variables to fill the layout
    [X] Name change
    [X] Path creation
    [X] Real paths view
    [X] Avatar

[X] Path service
    [X] Database
        [X] Path
        [X] Stats
    [X] Path http dummy server
    [X] Path http proxy on gateway
    [X] Path creation
        [X] Dummy path creation api
        [X] Real path creation
    [X] Path deletion
    [X] Path updating
        [X] Path data update
        [X] Stats update
        [X] Stats delete
        [X] Stats create
        [X] Count update
    [X] Test
    [ ] Stat quota

[ ] Path page
    [X] Path view
        [X] Stats
        [X] Overall steps
    [X] Edit mode
        [X] Path deletion
        [X] Path data update
        [X] Stats updating
        [X] Stats deletion
        [X] Stats create
    [X] Stats count update
    [X] Path owner link
    [X] Change stat cards to stat lines
    [ ] Stat quota
        [X] HTML Template
        [ ] Interactivity and API request

[ ] Responsible design