/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/create-plan`, () => {
  describe('CreatePlan#POST', () => {
    it('should require alphanumeric id', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `123123!@#!@#!`,
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-planid')
      }
    })

    it('should require product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: null
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-productid')
      }
    })

    it('should require valid product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: 'invalid'
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-productid')
      }
    })

    it('should require amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: null,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-amount')
      }
    })

    it('should require currency', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'invalid',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-currency')
      }
    })

    it('should require valid interval', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'randomly',
        interval_count: 1,
        trial_period_days: 0,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-interval')
      }
    })

    it('should require valid interval count', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 'm',
        trial_period_days: 0,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-interval_count')
      }
    })

    it('should require valid trial period', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: -1,
        productid: administrator.product.id
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-trial_period_days')
      }
    })

    it('should create plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        currency: 'usd',
        amount: 1000,
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        productid: administrator.product.id
      }
      await req.route.api.post(req)
      await TestHelper.completeAuthorization(req)
      const plan = await req.route.api.post(req)
      assert.notEqual(null, plan)
    })
  })
})
