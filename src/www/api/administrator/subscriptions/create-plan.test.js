/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/create-plan', () => {
  describe('exceptions', () => {
    describe('invalid-planid', () => {
      it('invalid posted planid is not alphanumeric_', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: '123123!@#!@#!',
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })
    })

    describe('invalid-planid-length', () => {
      it('posted planid is too short', async () => {
        global.minimumPlanIDLength = 100
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'this',
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid-length')
      })

      it('posted planid is too long', async () => {
        global.maximumPlanIDLength = 1
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'that',
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid-length')
      })
    })

    describe('invalid-productid', () => {
      it('missing posted productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })

      it('invalid posted productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })
    })

    describe('invalid-product', () => {
      it('ineligible posted product is not published', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {})
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product')
      })
    })

    describe('invalid-amount', () => {
      it('missing posted amount', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-amount')
      })

      it('invalid posted amount', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: 'invalid',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-amount')
      })
    })

    describe('invalid-currency', () => {
      it('missing posted currency', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: '',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-currency')
      })

      it('invalid posted currency', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'invalid',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-currency')
      })
    })

    describe('invalid-interval', () => {
      it('missing posted interval', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: '',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-interval')
      })

      it('invalid posted interval', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'invalid',
          interval_count: '1',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-interval')
      })
    })

    describe('invalid-interval-count', () => {
      it('missing posted interval_count', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-interval_count')
      })

      it('invalid posted interval_count', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: 'nvalid',
          trial_period_days: '0',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-interval_count')
      })
    })

    describe('invalid-trial_period', () => {
      it('invalid posted trial_period', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: 'invalid',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-trial_period_days')
      })
    })

    describe('invalid-usage_type', () => {
      it('invalid posted usage_type', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
          currency: 'usd',
          amount: '1000',
          interval: 'month',
          interval_count: '1',
          trial_period_days: '7',
          usage_type: 'invalid',
          productid: administrator.product.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-usage_type')
      })
    })
  })

  describe('receives', () => {
    it('optional posted published (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id,
        published: 'true'
      }
      const plan = await req.post()
      assert.notStrictEqual(plan.metadata.published, undefined)
      assert.notStrictEqual(plan.metadata.published, null)
    })

    it('optional posted trial_period_days (integer)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '3',
        productid: administrator.product.id
      }
      const plan = await req.post()
      assert.strictEqual(plan.trial_period_days, 3)
    })

    it('optional posted usage_type (licensed|metered)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '3',
        usage_type: 'metered',
        productid: administrator.product.id
      }
      const plan = await req.post()
      assert.strictEqual(plan.usage_type, 'metered')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime() + 'r' + Math.ceil(Math.random() * '1000'),
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      req.filename = __filename
      req.saveResponse = true
      const plan = await req.post()
      assert.strictEqual(plan.object, 'plan')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_PLANID_LENGTH', async () => {
      global.minimumPlanIDLength = 100
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'this',
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-planid-length')
    })

    it('environment MAXIMUM_PLANID_LENGTH', async () => {
      global.maximumPlanIDLength = 1
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'that',
        currency: 'usd',
        amount: '1000',
        interval: 'month',
        interval_count: '1',
        trial_period_days: '0',
        productid: administrator.product.id
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-planid-length')
    })
  })
})
