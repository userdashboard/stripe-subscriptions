/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-plan`, () => {
  describe('UpdatePlan#PATCH', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createProduct(administrator, {published: true})
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      await TestHelper.createProduct(administrator, {published: true})
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createProduct(administrator, {})
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should reject invalid trial', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: administrator.product.id,
        trial_period_days: -1
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-trial_period_days')
      req.body = {
        productid: administrator.product.id,
        trial_period_days: 10000
      }
      errorMessage = null
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-trial_period_days')
      req.body = {
        productid: administrator.product.id,
        trial_period_days: 'invalid'
      }
      errorMessage = null
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-trial_period_days')
    })

    it('should update plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, {published: true})
      const newProduct = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        productid: newProduct.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
