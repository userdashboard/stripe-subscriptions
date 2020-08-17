/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/subscriptions/billing-profile', function () {
  this.timeout(60 * 60 * 10000)
  describe('before', () => {
    it('should reject invalid customer', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest('/account/subscriptions/billing-profile?customerid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-customerid')
    })

    it('should reject other account\'s customer', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/billing-profile?customerid=${user.customer.id}`)
      req.account = user2.account
      req.session = user2.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('should bind data to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/account/subscriptions/billing-profile?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.customer.id, user.customer.id)
    })
  })

  describe('view', () => {
    it('should have row for customer (screenshots)', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest(`/account/subscriptions/billing-profile?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/subscriptions' },
        { click: '/account/subscriptions/billing-profiles' },
        { click: `/account/subscriptions/billing-profile?customerid=${user.customer.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.customer.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
