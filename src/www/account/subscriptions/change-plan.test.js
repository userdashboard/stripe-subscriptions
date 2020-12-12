/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/change-plan', function () {
  const cachedResponses = {}
  const cachedPlans = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    global.delayDiskWrites = true
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    const plan1 = administrator.plan
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createSubscription(user, plan1.id)
    const req1 = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`)
    req1.account = user.account
    req1.session = user.session
    cachedResponses.noPlans = await req1.get()
    const plan2 = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      amount: '2000',
      trial_period_days: '0'
    })
    const plan3 = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      unpublished: 'true',
      amount: '1000',
      trial_period_days: '0'
    })
    cachedPlans.push(plan1.id, plan2.id, plan3.id)
    const req2 = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`)
    req2.account = user.account
    req2.session = user.session
    await req2.route.api.before(req2)
    cachedResponses.before = req2.data
    cachedResponses.returns = await req2.get()
    const req3 = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`)
    req3.account = user.account
    req3.session = user.session
    req3.filename = __filename
    req3.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/subscriptions' },
      { click: `/account/subscriptions/subscription?subscriptionid=${user.subscription.id}` },
      { click: `/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}` },
      { fill: '#submit-form' }
    ]
    req3.body = {
      planid: plan2.id,
      paymentmethodid: user.paymentMethod.id
    }
    cachedResponses.submit = await req3.post()
    const user2 = await TestHelper.createUser()
    await TestHelper.createCustomer(user2, {
      email: user2.profile.contactEmail,
      description: user2.profile.firstName
    })
    const freePlan = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      amount: '0',
      trial_period_days: '0'
    })
    await TestHelper.createSubscription(user2, freePlan.id)
    const req4 = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user2.subscription.id}`)
    req4.account = user2.account
    req4.session = user2.session
    req4.body = {
      planid: plan2.id,
      paymentmethodid: ''
    }
    cachedResponses.invalidPaymentMethod = await req4.post()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.plans.length, 1)
      assert.strictEqual(data.plans[0].id, cachedPlans[1])
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should remove the form if there are no plans', async () => {
      const result = cachedResponses.noPlans
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'no-plans')
    })
  })

  describe('submit', () => {
    it('should apply plan update (screenshots)', async () => {
      const result = cachedResponses.submit
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('should reject paid plan without payment information', async () => {
      const result = cachedResponses.invalidPaymentMethod
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-paymentmethodid')
    })
  })
})
