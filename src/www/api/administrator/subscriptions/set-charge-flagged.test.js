/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/set-charge-flagged', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-chargeid', () => {
      it('missing querystring charge', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-charge-flagged')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })

      it('invalid querystring charge', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-charge-flagged?chargeid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })
    })

    describe('invalid-charge', () => {
      it('ineligible querystring charge is already flagged', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.flagCharge(administrator, user.charge.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-charge')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const charge = await req.patch()
      assert.strictEqual(charge.fraud_details.user_report, 'fraudulent')
    })
  })
})
