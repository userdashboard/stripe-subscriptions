/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/edit-plan', function () {
  describe('before', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/edit-plan?planid=invalid')
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

    it('should reject unpublished plan', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithUnpublishedPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-plan')
    })

    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.plan.id, administrator.plan.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should reject missing productid', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        productid: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-productid')
    })

    it('should reject invalid trial period', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        trial_period_days: 'invalid',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-trial_period_days')
    })

    it('should update plan (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const product2 = await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: await product2.id
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/plans' },
        { click: `/administrator/subscriptions/plan?planid=${administrator.plan.id}` },
        { click: `/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
