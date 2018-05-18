/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-plan`, () => {
  describe('UpdatePlan#PATCH', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createProduct(administrator, { published: true })
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-planid')
      }
    })

    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: 'invalid'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-productid')
      }
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true, unpublished: true })
      await TestHelper.createProduct(administrator, { published: true })
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-plan')
      }
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createProduct(administrator, { published: true, unpublished: true })
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-product')
      }
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createProduct(administrator, { })
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-product')
      }
    })

    it('should reject invalid trial', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: administrator.product.id,
        trial_period_days: -1
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-trial_period_days')
      }
      req.body = {
        productid: administrator.product.id,
        trial_period_days: 10000
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-trial_period_days')
      }
      req.body = {
        productid: administrator.product.id,
        trial_period_days: 'invalid'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-trial_period_days')
      }
    })

    it('should update plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        productid: newProduct.id
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
