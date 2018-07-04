/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/create-plan`, () => {
  describe('CreatePlan#POST', () => {
    it('should require alphanumeric id', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `123123!@#!@#!`,
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should require product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should require valid product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should require amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: null,
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-amount')
    })

    it('should require currency', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'invalid',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-currency')
    })

    it('should require valid interval', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'randomly',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-interval')
    })

    it('should require valid interval count', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: 'm',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-interval_count')
    })

    it('should require valid trial period', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: -'1',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-trial_period_days')
    })

    it('should create plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      await req.route.api.post(req)
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      const plan = await req.route.api.post(req)
      assert.notEqual(null, plan)
    })

    it('should create published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-plan`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        planid: `plan` + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id,
        published: 'true'
      }
      await req.route.api.post(req)
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      const plan = await req.route.api.post(req)
      assert.notEqual(null, plan)
      assert.notEqual(null, plan.metadata.published)
    })
  })
})
