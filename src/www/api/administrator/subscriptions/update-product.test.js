/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-product`, () => {
  describe('UpdateProduct#PATCH', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'name',
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-productid')
      }
    })

    it('should reject invalid name', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        name: null,
        statement_descriptor: 'new-description',
        unit_label: 'new-thing'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-name')
      }
    })

    it('should reject invalid name length', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        name: '123456789012345678901234567890',
        statement_descriptor: 'new-description',
        unit_label: 'new-thing'
      }
      global.MAXIMUM_PRODUCT_NAME_LENGTH = 3
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-product-name-length')
      }
    })

    it('should reject invalid statement_descriptor', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        name: 'new-name',
        statement_descriptor: null,
        unit_label: 'new-thing'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-statement_descriptor')
      }
    })

    it('should reject invalid unit_label', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        name: 'new-name',
        statement_descriptor: 'new-thing descriptor',
        unit_label: null
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-unit_label')
      }
    })

    it('should update product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        name: 'new-name',
        statement_descriptor: 'new-description',
        unit_label: 'new-thing'
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
