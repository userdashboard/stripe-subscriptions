/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/create-product`, () => {
  describe('CreateProduct#POST', () => {
    it('should require name', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-product`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: null,
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-name')
    })

    it('should require statement_descriptor', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-product`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: `productName`,
        statement_descriptor: null,
        unit_label: 'thing'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-statement_descriptor')
    })

    it('should create product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-product`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: `product` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      await req.route.api.post(req)
      await TestHelper.completeAuthorization(req)
      const product = await req.route.api.post(req)
      assert.notEqual(null, product)
      assert.notEqual(null, product.id)
    })
  })
})
