/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/create-subscription', () => {
  describe('exceptions', () => {
    describe('invalid-customerid', () => {
      it('missing querystring customerid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-subscription')
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })

      it('invalid querystring customerid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-subscription?customerid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })
    })

    describe('invalid-customer', () => {
      it('ineligible querystring customer requires payment method', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          planid: administrator.plan.id
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

    describe('invalid-planid', () => {
      it('missing posted planid', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: 'invalid',
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid posted planid', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: 'invalid',
          paymentmethodid: user.paymentMethod.id
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

    describe('invalid-plan', () => {
      it('ineligible posted plan is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithNotPublishedPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id,
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })

      it('ineligible posted plan is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithUnpublishedPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id,
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        planid: administrator.plan.id,
        paymentmethodid: user.paymentMethod.id
      }
      req.filename = __filename
      req.saveResponse = true
      const subscriptionNow = await req.post()
      assert.strictEqual(subscriptionNow.object, 'subscription')
    })
  })
})
