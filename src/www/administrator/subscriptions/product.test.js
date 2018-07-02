/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/product', () => {
  describe('Product#BEFORE', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/product?productid=invalid', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should bind product to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/product?productid=${administrator.product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.product, null)
      assert.equal(req.data.product.id, administrator.product.id)
    })
  })

  describe('Product#GET', () => {
    it('should have row for product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/product?productid=${administrator.product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.product.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })
})
