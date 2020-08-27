# Stripe Subscriptions module for Dashboard
![Test suite status](https://github.com/userdashboard/stripe-subscriptions/workflows/test-and-publish/badge.svg?branch=master)

Dashboard bundles everything a web app needs, all the "boilerplate" like signing in and changing passwords, into a parallel server so you can write a much smaller web app.

The Stripe Subscriptions module adds a complete interface for creating and managing your Stripe products, plans, subscriptions etc and a complete interface for users to subscribe to plans.

Users can self-cancel their subscriptions at any time and you can nominate an n-day-period allowing users to refund themselves too.

You can optionally require a subscription and/or no unpaid invoices from all users outside of the `/account/` and `/administrator/` content.

Environment configuration variables are documented in `start-dev.sh`.  You can view API documentation in `api.txt`, or in more detail on the [documentation site](https://userdashboard.github.io/).  Join the freenode IRC #userdashboard chatroom for support - [Web IRC client](https://kiwiirc.com/nextclient/).

## Import this module

Install the module with NPM:

    $ npm install @userdashboard/stripe-subscriptions

Edit your `package.json` to activate the module:

    "dashboard": {
      "modules": [
        "@userdashboard/stripe-subscriptions"
      ]
    }

## Storage engine

By default this module will share whatever storage you use for Dashboard.  You can specify a Dashboard storage module to use instead.

        SUBSCRIPTIONS_STORAGE=@userdashboard/storage-postgresql
        SUBSCRIPTIONS_DATABASE_URL=postgres://localhost:5432/subscriptions

## Setting up your Stripe credentials

You will need to retrieve various keys from [Stripe](https://stripe.com).  During development your webhook will be created automatically, but in production with multiple dashboard server instances they share a configured webhook:

- create your Stripe account and find your API keys
- create a webhook for https://your_domain/webhooks/subscriptions/index-subscription-data 
- environment STRIPE_JS=3|2|false
- environment STRIPE_KEY=sk_test_xxxxxxx
- environment STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxx
- environment SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET=whsec_xxxxxxxx

## Requiring subscriptions

Environment variables are documented in Dashboard and each module's `/start-dev.sh`.

You can require subscriptions and no overdue invoices through environment variables:

        REQUIRE_SUBSCRIPTION=true
        REQUIRE_PAYMENT=true

### Configuring your products and plans

This module adds a complete interface for creating products and plans.  Stripe's nomenclature and structure is used directly so for more information refer to the <a href="https://stripe.com/docs">Stripe documentation</a> and <a href="https://stripe.com/docs/api">Stripe API documentation</a>.

Users subscribe to plans and plans must be built from products.  Additionally, this module imposes a 'publish' status on products and plans that controls access to them by users.

    1.  Create product
    2.  Publish product
    3.  Create plan
    4.  Publish plan
    5.  User selects plan from published plans
    6.  User creates subscription optionally with payment

You can use links for users to create a subscription to a specific plan:

    /account/subscriptions/start-subscription?planid=X

### Request Subscription data from your Dashboard server

Dashboard and official modules are completely API-driven and you can access the same APIs on behalf of the user making requests.  You perform `GET`, `POST`, `PATCH`, and `DELETE` HTTP requests against the API endpoints to fetch or modify data.  This example uses NodeJS to fetch the user's invoices from the Dashboard server, your application server can be in any language.

You can view API documentation within the NodeJS modules' `api.txt` files, or on the [documentation site](https://userdashboard.github.io/stripe-subscriptions-api).

        const requestOptions = {
            host: 'dashboard.example.com',
            path: `/api/user/subscriptions/invoices?accountid=${accountid}`,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-application-server-token': process.env.APPLICATION_SERVER_TOKEN
            }
        }
        if (accountid) {
            requestOptions.headers['x-accountid'] = accountid
            requestOptions.headers['x-sessionid'] = sessionid
        }
        const invoicesArray = await proxy(requestOptions)

        function proxy = util.promisify((requestOptions, callback) => {
          const proxyRequest = require('https').request(requestOptions, (proxyResponse) => {
              let body = ''
              proxyResponse.on('data', (chunk) => {
                  body += chunk
              })
              return proxyResponse.on('end', () => {
                  return callback(null, JSON.parse(body))
              })
          })
          proxyRequest.on('error', (error) => {
              return callback(error)
          })
          return proxyRequest.end()
        })
