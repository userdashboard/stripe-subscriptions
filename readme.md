# Stripe Subscriptions for Dashboard

This module adds subscription billing functionality to [userappstore/dashboard](https://github.com/userappstore/dashboard).  It adds an account menu for your users to manage their billing information and subscriptions, and an administrator menu to manage your plans, coupons, customers etc.


## 1) Install the module in your dashboard project

    `npm install @userappstore/stripe-subscriptions`

## 2) Include the module in your package.json configuration

    "dashboard-modules": [
      "@userappstore/stripe-subscriptions"
    ]
    
## Roadmap

This module does not currently support complex subscriptions where you might add or remove items.

This module requires sales taxes applied where appropriate.

This module has WIP or missing APIs and UIs for disputes, transactions, invoice line items.

## APIs

The code is partitioned into three groups.

### Browser interface

These HTML pages are paired with a NodeJS handler that responds to HTTP requests on GET and POST requests.  The user and administrator interfaces are both formed out of these pages.

### Internal API

The Stripe API is the internal API for the Stripe Subscriptions module.

### Private / Public API

These NodeJS files are only accessible to dashboard modules and code running on your server.  They compose operations out of the `Internal API` and other parts of the `Private API` for user and administrator operations.  

The `Private API` can be exposed to HTTP requests by client-side JavaScript and user's web browser extensions.  These requests are authenticated by the web browser cookie created when signing in, the same as when a user is opening pages in their browser.

    process.env.ALLOW_PUBLIC_API = true

The `Private API` is accessible to your and module code, remapped to a NodeJS global object that recieves a HTTP request or similar and returns data or performs operations.

    const req = {
      body: { 
        planid: 'a-plan'
      }
    }
    const subscription = await global.api.user.subscriptions.CreateSubscription.post(req)

## Unit tests

Each NodeJS file for the APIs and Browser Interface have an accompanying .test.js file that run via `mocha`:

    $ npm install mocha -g
    $ npm test

## Privacy

This module includes no client-side JavaScript so browsing the application shares no data with any third parties.

On the server-side a Stripe customer object is created and the dashboard  stores the IP and User Agent whenever data is created.

Only your Stripe customer id is stored in the dashboard database.

Your account id is stored in the Stripe database attached to your customer object.

## Security

All user and administration create, delete and update API endpoints require authorization.
