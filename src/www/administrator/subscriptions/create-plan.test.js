/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/create-plan', () => {
  describe('CreatePlan#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('CreatePlan#POST', () => {
    it('should reject missing planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: null,
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-planid', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should enforce planid length', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: '1234567890123456789012345678901234567890',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-planid-length', message.attr.template)
      }
      global.MAXIMUM_PLAN_LENGTH = 3
      return req.route.api.post(req, res)
    })

    it('should reject missing productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: null
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-productid', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-product', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-product', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject missing currency', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: null,
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-currency', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid currency', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'invalid',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-currency', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject missing amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: null,
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-amount', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '-1',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-amount', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject missing interval', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: null,
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-interval', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid interval', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'invalid',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-interval', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid interval_count', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: null,
        interval_count: 'invalid',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-interval', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid trial_period_days', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '100',
        interval: 'month',
        interval_count: '1',
        trial_period_days: 'invalid',
        currency: 'usd',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-trial_period_days', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should create after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: await administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
