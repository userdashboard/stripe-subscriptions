/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/charge', function () {
  beforeEach(TestHelper.setupWebhook)
  afterEach(TestHelper.deleteOldWebhooks)
  describe('exceptions', () => {
    describe('invalid-chargeid', () => {
      it('missing querystring chargeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/charge')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })

      it('invalid querystring chargeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/charge?chargeid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({ amount: '1000', interval: 'day' })
        const plan1 = administrator.plan
        const plan2 = await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          trial_period_days: '0',
          amount: '20000',
          interval: 'week'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, plan1.id)
        await TestHelper.changeSubscription(user, plan2.id)
        const chargeid2 = user.charge.id
        const user2 = await TestHelper.createUser()
        await TestHelper.createCustomer(user2, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/charge?chargeid=${chargeid2}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/charge?chargeid=${user.charge.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        paymentmethodid: user.paymentMethod.id
      }
      req.filename = __filename
      req.saveResponse = true
      const charge = await req.get()
      assert.strictEqual(charge.object, 'charge')
    })
  })
})
