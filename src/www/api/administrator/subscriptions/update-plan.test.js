/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/update-plan', () => {
  describe('exceptions', () => {
    describe('invalid-planid', () => {
      it('missing querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-plan')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-plan?planid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })
    })

    describe('invalid-plan', () => {
      it('ineligible querystring plan is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithUnpublishedPlan()
        const newProduct = await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: newProduct.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })
    })

    describe('invalid-productid', () => {
      it('invalid posted productid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })
    })

    describe('invalid-product', () => {
      it('ineligible posted product is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const newProduct = await TestHelper.createProduct(administrator, {})
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: newProduct.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product')
      })

      it('ineligible posted product is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const newProduct = await TestHelper.createProduct(administrator, {
          published: 'true',
          unpublished: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: newProduct.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product')
      })
    })

    describe('invalid-trial_period_days', () => {
      it('invalid posted trial_period_days', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: administrator.product.id,
          trial_period_days: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-trial_period_days')
      })

      it('ineligible posted trial_period_days is negative', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: administrator.product.id,
          trial_period_days: -1
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-trial_period_days')
      })

      it('ineligible posted trial_period_days greater than 365', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          productid: administrator.product.id,
          trial_period_days: '1000'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-trial_period_days')
      })
    })
  })

  describe('receives', () => {
    it('optional posted trial_period_days (integer)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        trial_period_days: '18'
      }
      await req.patch()
      const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/plan?planid=${administrator.plan.id}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const plan = await req2.get()
      assert.strictEqual(plan.trial_period_days, parseInt(req.body.trial_period_days, 10))
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const newProduct = await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      req.filename = __filename
      req.saveResponse = true
      const plan = await req.patch()
      assert.strictEqual(plan.product, newProduct.id)
    })
  })
})
