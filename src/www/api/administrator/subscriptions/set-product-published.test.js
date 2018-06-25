/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-product-published`, () => {
  describe('SetProductPublished#PATCH', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-published?productid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should reject published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-published?productid=${administrator.product.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should publish product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-published?productid=${administrator.product.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
