/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/apply-customer-coupon', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    it('should reject invalid customer', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/apply-customer-coupon?customerid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-customerid')
    })

    it('should reject customer with coupon', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/apply-customer-coupon?customerid=${user.customer.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: administrator.coupon.id
      }
      await TestHelper.createCustomerDiscount(administrator, user.customer, administrator.coupon)
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-customer')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/apply-customer-coupon?customerid=${user.customer.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.customer.id, user.customer.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/apply-customer-coupon?customerid=${user.customer.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should apply coupon (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/apply-customer-coupon?customerid=${user.customer.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: administrator.coupon.id
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/customers' },
        { click: `/administrator/subscriptions/customer?customerid=${user.customer.id}` },
        { click: `/administrator/subscriptions/apply-customer-coupon?customerid=${user.customer.id}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
