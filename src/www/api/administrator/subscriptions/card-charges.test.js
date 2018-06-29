/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/card-charges', () => {
  describe('CardCharges#GET', () => {
    it('should limit charges on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      await TestHelper.createSubscription(user, plan2.id)
      const invoice2 = user.invoice
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/card-charges?cardid=${user.card.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, global.PAGE_SIZE)
      assert.equal(charges[0].amount, plan2.amount)
      assert.equal(charges[0].invoice, invoice2.id)
      assert.equal(charges[1].amount, plan1.amount)
      assert.equal(charges[1].invoice, invoice1.id)
    })
  })
})
