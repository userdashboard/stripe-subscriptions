/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/create-plan', function () {
  describe('view', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: true
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should reject missing planid', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: true
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: '',
        usage_type: 'licensed',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-planid')
    })

    it('should enforce planid length', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: '1234567890123456789012345678901234567890',
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      global.maximumPlanIDLength = 3
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-planid-length')
    })

    it('should reject missing productid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-productid')
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-productid')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true',
        unpublished: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-productid')
    })

    it('should reject missing currency', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: '',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-currency')
    })

    it('should reject invalid currency', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'invalid',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-currency')
    })

    it('should reject missing usage_type', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: '',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-usage_type')
    })

    it('should reject missing amount', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-amount')
    })

    it('should reject invalid amount', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '-1',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-amount')
    })

    it('should reject missing interval', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: '',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-interval')
    })

    it('should reject invalid interval', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: '',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-interval')
    })

    it('should reject invalid interval_count', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: '',
        interval_count: 'invalid',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-interval')
    })

    it('should reject invalid trial_period_days', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '100',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '-1',
        currency: 'usd',
        productid: administrator.product.id
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-trial_period_days')
    })

    it('should create plan (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        usage_type: 'licensed',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        currency: 'usd',
        productid: administrator.product.id
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/plans' },
        { click: '/administrator/subscriptions/create-plan' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      assert.strictEqual(true, result.redirect.startsWith('/administrator/subscriptions/plan?planid='))
    })
  })
})
