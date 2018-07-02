const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.disputeid) {
      throw new Error('invalid-disputeid')
    }
    if (!req.body || !req.body.cardid) {
      throw new Error('invalid-cardid')
    }
    const disputeExists = await dashboard.RedisList.exists(`disputes`, req.query.disputeid)
    const owndisputeExists = disputeExists ? await dashboard.RedisList.exists(`customer:disputes:${req.customer.id}`, req.query.disputeid) : false
    if (!owndisputeExists) {
      if (disputeExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-disputeid')
    }
    const cardExists = await dashboard.RedisList.exists(`cards`, req.body.cardid)
    const ownCardExists = cardExists ? await dashboard.RedisList.exists(`customer:cards:${req.customer.id}`, req.body.cardid) : false
    if (!ownCardExists) {
      if (cardExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-cardid')
    }
    let dispute
    try {
      dispute = await stripe.disputes.retrieve(req.query.disputeid, req.stripeKey)
    } catch (error) {
    }
    if (!dispute) {
      if (owndisputeExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-disputeid')
    }
    if (dispute.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    if (dispute.forgiven || dispute.paid) {
      throw new Error('invalid-dispute')
    }
    if (!dispute.closed) {
      req.body.closed = true
    }
  },
  patch: async (req) => {
    try {
      const dispute = await stripe.disputes.pay(req.query.disputeid, {source: req.body.sourceid}, req.stripeKey)
      req.success = true
      return dispute
    } catch (error) {
      if (error.message.indexOf(`Customer ${req.customer.id} does not have a linked source`) === 0) {
        throw new Error('invalid-cardid')
      }
      throw new Error('unknown-error')
    }
  }
}
