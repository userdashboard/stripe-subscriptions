module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  if (req.connectAccount) {
    req.stripeKey = {
      api_key: process.env.STRIPE_KEY,
      stripe_account: req.connectAccount
    }
  } else {
    req.stripeKey = {
      api_key: process.env.STRIPE_KEY
    }
  }
}
