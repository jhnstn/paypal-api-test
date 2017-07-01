# paypal-api-test

Set `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` env variables to your sandbox application.

Set up webhooks to point to `/hook`. Any request to that endpoint will be echoed in the browser console via websockets.

Socket connection can be verified in the console by calling the global function `debugHookEndpoint(msg)`.
That will POST the `msg` to the `/hook` endpiont. The `msg` should be echoed back to the console if the socket is connected.
