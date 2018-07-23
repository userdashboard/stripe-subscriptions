# Stripe subscriptions for Dashboard
Dashboard is a NodeJS project that accompanies a web app you build and provides a complete account system for your users and administration tools.  Dashboard divides your application into two components: a header with account and administrative menus and navigation bar; and a frame for serving content.

The content can come from Dashboard, Dashboard modules, content you added to Dashboard, or an app you built in any other language hosted separately.

This module adds a complete user and administrator `Private API` and `Web UI` for [Stripe subscriptions](https://stripe.com).

#### Dashboard documentation
- [Introduction](https://github.com/userappstore/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userappstore/dashboard/wiki/Configuring-Dashboard)
- [Contributing to Dashboard](https://github.com/userappstore/dashboard/wiki/Contributing-to-Dashboard)
- [Dashboard code structure](https://github.com/userappstore/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userappstore/dashboard/wiki/Server-Request-Lifecycle)

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.

## Installation

    $ mkdir project
    $ cd project
    $ npm init
    $ npm install @userappstore/dashboard
    $ npm install @userappstore/stripe-subscriptions
    # create a main.js
    $ node main.js

Your main.js should contain:

    const dashboard = require('./index.js')
    dashboard.start(__dirname)

Your package.json should contain:

    "dashboard": {
      "modules": [
        "@userappstore/maxmind-geoip",
        "@userappstore/stripe-subscriptions"
      ]
    }

## Testing

To test this module you will need:

1. Create an account at [Stripe](https://stripe.com/), you will need your `STRIPE_KEY` in your server dashboard configuration
2. Add real bank account details to your Stripe account, as the test bank account numbers are only supported when you are using Stripe Connect
3. Enable 'Process payments unsafely' in Integrations, within Business settings, required to send test cards without browser JS tokenization
4. Setup a webhook to your Stripe account to `https://your_url/api/webhooks/index-stripe-data`, you will need the `ENDPOINT_SECRET` in your dashboard configuration
5. Instance of `node main.js` running to receive webhooks, on your computer and in testing [ngrok](https://ngrok.com) may provide a publicly-accessible https://*.ngrok.io domain
6. `npm test`

The server and the tests will share the same Redis database so as the tests cause webhooks to be created the server will receive them and index them within the test database.
    
## Roadmap

This module currently only supports basic subscriptions with 1x a product.

This module currently does not apply any form of tax.

This module has WIP or incomplete API + UI for:
- disputes
- transaction objects
- invoice line item objects
- modifying invoices
