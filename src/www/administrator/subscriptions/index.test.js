/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions', function () {
  this.timeout(20 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest('/administrator/subscriptions')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.plans[0].id, administrator.plan.id)
      assert.strictEqual(req.data.subscriptions[0].id, user.subscription.id)
      assert.strictEqual(req.data.coupons[0].id, administrator.coupon.id)
    })
  })

  describe('view', () => {
    it('should have row for each plan', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const plan2 = await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: '2000',
        trial_period_days: '0'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const plan1Row = doc.getElementById(administrator.plan.id)
      const plan2Row = doc.getElementById(plan2.id)
      assert.strictEqual(plan1Row.tag, 'tr')
      assert.strictEqual(plan2Row.tag, 'tr')
    })

    it('should have row for each coupon', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const coupon1 = administrator.coupon
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const coupon2 = administrator.coupon
      const req = TestHelper.createRequest('/administrator/subscriptions')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const coupon1Row = doc.getElementById(coupon1.id)
      const coupon2Row = doc.getElementById(coupon2.id)
      assert.strictEqual(coupon1Row.tag, 'tr')
      assert.strictEqual(coupon2Row.tag, 'tr')
    })

    it('should have row for each subscription (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const plan2 = await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: '2000',
        trial_period_days: '0'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const subscription1 = await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
      const subscription2 = await TestHelper.createSubscription(user2, plan2.id)
      const req = TestHelper.createRequest('/administrator/subscriptions')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const subscription1Row = doc.getElementById(subscription1.id)
      const subscription2Row = doc.getElementById(subscription2.id)
      assert.strictEqual(subscription1Row.tag, 'tr')
      assert.strictEqual(subscription2Row.tag, 'tr')
    })
  })
})
