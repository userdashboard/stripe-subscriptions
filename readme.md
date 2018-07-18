# Stripe subscriptions for Dashboard
Dashboard is a NodeJS project that accompanies a web app you build and provides a complete account system for your users and administration tools.  Dashboard divides your application into two components: a header with account and administrative menus and navigation bar; and a frame for serving content.

The content can come from Dashboard, Dashboard modules, content you added to Dashboard, or an app you built in any other language hosted separately.

This module adds a complete user and administrator `Private API` and `Web UI` for [Stripe subscriptions](https://stripe.com).

[![Build Status](https://travis-ci.org/userappstore/stripe-subscriptions.svg?branch=release)](https://travis-ci.org/userappstore/stripe-subscriptions)

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
    # create a  main.js
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
    
## Roadmap

This module currently only supports basic subscriptions with 1x a product.

This module currently does not apply any form of tax.

This module has WIP or incomplete API + UI for:
- disputes
- transaction objects
- invoice line item objects
- modifying invoices
