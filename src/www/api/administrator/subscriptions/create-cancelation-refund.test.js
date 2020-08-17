/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/create-cancelation-refund', function () {
  this.timeout(60 * 60 * 1000)
  before(TestHelper.setupWebhook)
  after(TestHelper.deleteOldWebhooks)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-cancelation-refund')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          refund: 'at_period_end'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })

      it('invalid querystring subscriptionid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-cancelation-refund?subscriptionid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })
    })

    describe('invalid-subscription', () => {
      it('ineligible querystring subscription is not active', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          amount: '10000',
          trial_period_days: '0'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.cancelSubscription(user)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-cancelation-refund?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-cancelation-refund?subscriptionid=${user.subscription.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        refund: 'credit'
      }
      req.filename = __filename
      req.saveResponse = true
      const refund = await req.post()
      assert.strictEqual(refund.object, 'refund')
    })
  })
})
