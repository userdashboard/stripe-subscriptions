/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/plan', function () {
  this.timeout(60 * 60 * 1000)
  describe('before', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/plan?planid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-planid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.plan.id, administrator.plan.id)
    })
  })

  describe('view', () => {
    it('should present the plan table (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/plans' },
        { click: `/administrator/subscriptions/plan?planid=${administrator.plan.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(administrator.plan.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
