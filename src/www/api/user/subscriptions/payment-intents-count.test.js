/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/payment-intents-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        await TestHelper.createPaymentMethod(user, {
          cvc: '111',
          number: '4111111111111111',
          exp_month: '1',
          exp_year: (new Date().getFullYear() + 1).toString().substring(2),
          name: user.profile.firstName + ' ' + user.profile.lastName,
          address_line1: '285 Fulton St',
          address_line2: 'Apt 893',
          address_city: 'New York',
          address_state: 'NY',
          address_zip: '10007',
          address_country: 'US',
          default: 'true'
        })
        await TestHelper.createPaymentIntent(user, {
          amount: '10000',
          currency: 'usd',
          paymentmethodid: user.paymentMethod.id
        })
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/payment-intents-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
