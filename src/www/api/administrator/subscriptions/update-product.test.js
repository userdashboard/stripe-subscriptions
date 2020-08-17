/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/update-product', () => {
  describe('exceptions', () => {
    describe('invalid-productid', () => {
      it('missing querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-product')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'name',
          statement_descriptor: 'description',
          unit_label: 'thing'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })

      it('invalid querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-product?productid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'name',
          statement_descriptor: 'description',
          unit_label: 'thing'
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
      it('ineligible querystring product is unpublished', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true',
          unpublished: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'new-name',
          statement_descriptor: 'new-description',
          unit_label: 'new-thing'
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

    describe('invalid-name', () => {
      it('invalid posted name', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name')
      })
    })

    describe('invalid-name-length', () => {
      it('posted name too short', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'PROD'
        }
        global.minimumProductNameLength = 30
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name-length')
      })

      it('posted name too long', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: '123456789012345678901234567890'
        }
        global.maximumProductNameLength = 3
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name-length')
      })
    })

    describe('invalid-statement_descriptor', () => {
      it('invalid posted statement_descriptor', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          statement_descriptor: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-statement_descriptor')
      })
    })

    describe('invalid-statement_descriptor-length', () => {
      it('posted statement_descriptor too short', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          statement_descriptor: '1234'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-statement_descriptor-length')
      })

      it('posted statement_descriptor too long', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          statement_descriptor: '1234567890 123456567890 1234567890'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-statement_descriptor-length')
      })
    })

    describe('invalid-unit_label', () => {
      it('missing posted unit_label', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          unit_label: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-unit_label')
      })
    })
  })

  describe('receives', () => {
    it('optional posted name', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'testing'
      }
      const productNow = await req.patch(req)
      assert.strictEqual(productNow.name, 'testing')
    })

    it('optional posted statement_descriptor', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        statement_descriptor: 'descriptor'
      }
      const productNow = await req.patch(req)
      assert.strictEqual(productNow.statement_descriptor, 'descriptor')
    })

    it('optional posted unit_label', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        unit_label: 'new-thing'
      }
      const productNow = await req.patch(req)
      assert.strictEqual(productNow.unit_label, 'new-thing')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-name',
        statement_descriptor: 'new-description',
        unit_label: 'new-thing'
      }
      req.filename = __filename
      req.saveResponse = true
      const product = await req.patch()
      assert.strictEqual(product.object, 'product')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_PRODUCT_NAME_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      global.minimumProductNameLength = 100
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-name'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-name-length')
    })

    it('environment MAXIMUM_PRODUCT_NAME_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      global.maximumProductNameLength = 1
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-name'
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-name-length')
    })
  })
})
