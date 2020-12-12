/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/confirm-subscription', function () {
  const cachedResponses = {}
  let publishedPlan
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    publishedPlan = administrator.plan
    const notPublishedPlan = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id
    })
    const unpublishedPlan = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      published: 'true',
      unpublished: 'true'
    })
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    const validCustomer = user.customer
    const req1 = TestHelper.createRequest(`/account/subscriptions/confirm-subscription?planid=${unpublishedPlan.id}`)
    req1.account = user.account
    req1.session = user.session
    try {
      await req1.route.api.before(req1)
    } catch (error) {
      cachedResponses.unpublishedPlan = error.message
    }
    const req2 = TestHelper.createRequest(`/account/subscriptions/confirm-subscription?planid=${notPublishedPlan.id}`)
    req2.account = user.account
    req2.session = user.session
    try {
      await req2.route.api.before(req2)
    } catch (error) {
      cachedResponses.notPublishedPlan = error.message
    }
    const req3 = TestHelper.createRequest(`/account/subscriptions/confirm-subscription?planid=${publishedPlan.id}`)
    req3.account = user.account
    req3.session = user.session
    await req3.route.api.before(req3)
    cachedResponses.before = req3.data
    cachedResponses.returns = await req3.get()
    const invalidCustomer = await TestHelper.createCustomer(user, {
      email: user.profile.contactEmail,
      description: user.profile.firstName
    })
    const req4 = TestHelper.createRequest(`/account/subscriptions/confirm-subscription?planid=${publishedPlan.id}`)
    req4.account = user.account
    req4.session = user.session
    req4.body = {
      customerid: invalidCustomer.id,
      paymentmethodid: 'invalid'
    }
    cachedResponses.invalidPaymentMethod = await req4.post()
    const req5 = TestHelper.createRequest(`/account/subscriptions/confirm-subscription?planid=${publishedPlan.id}`)
    req5.account = user.account
    req5.session = user.session
    req5.filename = __filename
    req5.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/plans' },
      { click: `/account/subscriptions/plan?planid=${publishedPlan.id}` },
      { click: `/account/subscriptions/start-subscription?planid=${publishedPlan.id}` },
      {
        click: '#submit-button',
        body: {
          planid: publishedPlan.id
        }
      },
      { fill: '#submit-form' }
    ]
    req5.body = {
      customerid: validCustomer.id,
      paymentmethodid: user.paymentMethod.id
    }
    cachedResponses.submit = await req5.post()
  })
  describe('exceptions', () => {
    it('invalid-planid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/confirm-subscription?planid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-planid')
    })

    it('invalid-plan', async () => {
      let errorMessage = cachedResponses.unpublishedPlan
      assert.strictEqual(errorMessage, 'invalid-plan')
      errorMessage = cachedResponses.notPublishedPlan
      assert.strictEqual(errorMessage, 'invalid-plan')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.plan.id, publishedPlan.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should start subscription (screenshots)', async () => {
      const result = cachedResponses.submit
      assert.strictEqual(result.redirect, '/home')
    })
  })

  describe('errors', () => {
    it('invalid-paymentmethodid', async () => {
      const result = cachedResponses.invalidPaymentMethod
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-paymentmethodid')
    })
  })
})
