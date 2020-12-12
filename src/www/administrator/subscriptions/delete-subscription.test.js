/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/administrator/subscriptions/delete-subscription', function () {
  const cachedResponses = {}
  let cachedSubscription
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    const paidPlan = administrator.plan
    const freeTrialPlan = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      published: 'true',
      amount: '100000',
      trial_period_days: '10'
    })
    const freePlan = await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      published: 'true',
      amount: '0'
    })
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    const freeSubscription = cachedSubscription = await TestHelper.createSubscription(user, freePlan.id)
    const paidSubscription = await TestHelper.createSubscription(user, paidPlan.id)
    const trialSubscription = await TestHelper.createSubscription(user, freeTrialPlan.id)
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    // test before with a missing subscriptionid
    const req = TestHelper.createRequest('/administrator/subscriptions/delete-subscription')
    req.account = administrator.account
    req.session = administrator.session
    try {
      await req.route.api.before(req)
    } catch (error) {
      cachedResponses.missingQueryString = error.message
    }
    req.url = '/administrator/subscriptions/delete-subscription?subscriptionid=invalid'
    req.query = {
      subscriptionid: 'invalid'
    }
    await req.route.api.before(req)
    cachedResponses.invalidQuerystring = req.error
    delete (req.error)
    // test before data bind
    req.query = {
      subscriptionid: freeSubscription.id
    }
    await req.route.api.before(req)
    cachedResponses.before = req.data
    delete (req.query)
    // test get
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${freeSubscription.id}`
    cachedResponses.returnsFreePlan = await req.get()
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${trialSubscription.id}`
    cachedResponses.returnsFreeTrial = await req.get()
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${paidSubscription.id}`
    cachedResponses.returnsPaidPlan = await req.get()
    // test submit
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${freeSubscription.id}`
    cachedResponses.submitFreeImmedate = await req.post()
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    await TestHelper.createSubscription(user, freePlan.id)
    req.body = {
      refund: 'at_period_end'
    }
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`
    cachedResponses.submitFreeAtPeriodEnd = await req.post()
    delete (req.body)
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${trialSubscription.id}`
    cachedResponses.submitFreeTrialImmediate = await req.post()
    req.body = {
      refund: 'at_period_end'
    }
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    await TestHelper.createSubscription(user, freeTrialPlan.id)
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`
    cachedResponses.submitFreeTrialAtPeriodEnd = await req.post()
    delete (req.body)
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${paidSubscription.id}`
    cachedResponses.submitPaidImmediate = await req.post()
    await TestHelper.createSubscription(user, paidPlan.id)
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`
    cachedResponses.submitPaidAtPeriodEnd = await req.post()
    req.body = {
      refund: 'at_period_end'
    }
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    await TestHelper.createSubscription(user, paidPlan.id)
    req.body = {
      refund: 'credit'
    }
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`
    cachedResponses.submitPaidCredit = await req.post()
    const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createSubscription(user2, paidPlan.id)
    req.body = {
      refund: 'refund'
    }
    req.url = `/administrator/subscriptions/delete-subscription?subscriptionid=${user2.subscription.id}`
    req.filename = __filename
    req.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator/subscriptions' },
      { click: '/administrator/subscriptions/subscriptions' },
      { click: `/administrator/subscriptions/subscription?subscriptionid=${user2.subscription.id}` },
      { click: `/administrator/subscriptions/delete-subscription?subscriptionid=${user2.subscription.id}` },
      { fill: '#submit-form' }
    ]
    cachedResponses.submitPaidRefund = await req.post()
    req.query = {
      subscriptionid: user2.subscription.id
    }
    await req.route.api.before(req)
    cachedResponses.invalidSubscription = req.error
  })
  describe('exceptions', () => {
    it('should reject missing subscription', async () => {
      const errorMessage = cachedResponses.missingQueryString
      assert.strictEqual(errorMessage, 'invalid-subscriptionid')
    })
    it('should reject invalid subscription', async () => {
      const errorMessage = cachedResponses.invalidQuerystring
      assert.strictEqual(errorMessage, 'invalid-subscriptionid')
    })
    it('should reject canceled subscription', async () => {
      const errorMessage = cachedResponses.invalidSubscription
      assert.strictEqual(errorMessage, 'invalid-subscription')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.subscription.id, cachedSubscription.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const result = cachedResponses.returnsFreePlan
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should show fields for free plan cancelations', async () => {
      const result = cachedResponses.returnsFreePlan
      const doc = TestHelper.extractDoc(result.html)
      const delay = doc.getElementById('delay-checkbox')
      assert.strictEqual(delay.tag, 'input')
      const immediate = doc.getElementById('immediate-checkbox')
      assert.strictEqual(immediate.tag, 'input')
      const refund = doc.getElementById('refund-checkbox')
      assert.strictEqual(refund, undefined)
      const credit = doc.getElementById('credit-checkbox')
      assert.strictEqual(credit, undefined)
    })

    it('should show fields for free trial cancelations', async () => {
      const result = cachedResponses.returnsFreeTrial
      const doc = TestHelper.extractDoc(result.html)
      const delay = doc.getElementById('delay-checkbox')
      assert.strictEqual(delay.tag, 'input')
      const immediate = doc.getElementById('immediate-checkbox')
      assert.strictEqual(immediate.tag, 'input')
      const refund = doc.getElementById('refund-checkbox')
      assert.strictEqual(refund, undefined)
      const credit = doc.getElementById('credit-checkbox')
      assert.strictEqual(credit, undefined)
    })

    it('should show fields for cancelation with credit or refund', async () => {
      const result = cachedResponses.returnsPaidPlan
      const doc = TestHelper.extractDoc(result.html)
      const delay = doc.getElementById('delay-checkbox')
      assert.strictEqual(delay.tag, 'input')
      const immediate = doc.getElementById('immediate')
      assert.strictEqual(immediate, undefined)
      const refund = doc.getElementById('refund-checkbox')
      assert.strictEqual(refund.tag, 'input')
      const credit = doc.getElementById('credit-checkbox')
      assert.strictEqual(credit.tag, 'input')
    })
  })

  describe('submit', () => {
    it('should cancel free subscription immediately (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({ amount: 0 })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      const result = cachedResponses.submitFreeImmedate
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should cancel free subscription at period end', async () => {
      const result = cachedResponses.submitFreeAtPeriodEnd
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should cancel free trial immediately', async () => {
      const result = cachedResponses.submitFreeTrialImmediate
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should cancel free trial at period end', async () => {
      const result = cachedResponses.submitFreeTrialAtPeriodEnd
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should cancel paid subscription and credit account', async () => {
      const result = cachedResponses.submitPaidCredit
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success-credit')
    })

    it('should cancel paid subscription and show refund', async () => {
      const result = cachedResponses.submitPaidRefund
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success-refund')
    })
  })
})
