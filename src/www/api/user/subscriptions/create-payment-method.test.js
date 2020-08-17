/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/create-payment-method', () => {
  describe('exceptions', () => {
    describe('invalid-customerid', () => {
      it('missing querystring customerid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-payment-method')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })

      it('invalid querystring customerid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-payment-method?customerid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          name: `${user2.profile.firstName} ${user2.profile.lastName}`,
          cvc: '111',
          number: '4111111111111111',
          exp_month: '1',
          exp_year: (new Date().getFullYear() + 1).toString().substring(2),
          address_line1: 'A street address',
          address_city: 'City',
          address_state: 'NY',
          address_zip: '90120',
          address_country: 'US',
          default: 'true'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('receives', () => {
    it('optionally-required posted name', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: '',
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-name')
    })

    it('optionally-required posted cvc', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '0',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-cvc')
    })

    it('optionally-required posted number', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: '',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-number')
    })

    it('optionally-required posted exp_month', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: '4111111111111111',
        exp_month: '',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-exp_month')
    })

    it('optionally-required posted exp_year', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '123',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: ''
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-exp_year')
    })

    it('optionally-required posted token', async () => {
      global.stripeJS = 2
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        token: ''
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-token')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2),
        address_line1: 'A street address',
        address_city: 'City',
        address_state: 'NY',
        address_zip: '90120',
        address_country: 'US',
        default: 'true'
      }
      req.filename = __filename
      req.saveResponse = true
      const paymentMethod = await req.post()
      assert.strictEqual(paymentMethod.object, 'payment_method')
    })
  })

  describe('configuration', () => {
    it('environment STRIPE_JS', async () => {
      global.stripeJS = 2
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2),
        address_line1: 'A street address',
        address_city: 'City',
        address_state: 'NY',
        address_zip: '90120',
        address_country: 'US',
        default: 'true'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-token')
    })
  })
})
