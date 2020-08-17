const TestHelper = require('./test-helper.js')

module.exports = {
  createOwnerWithPlan: async (planData) => {
    const owner = await TestHelper.createOwner()
    const product = await TestHelper.createProduct(owner, {
      published: true
    })
    planData = planData || {}
    await TestHelper.createPlan(owner, {
      productid: product.id,
      published: true,
      trial_period_days: planData.trial_period_days !== undefined ? planData.trial_period_days : 0,
      amount: planData.amount !== undefined ? planData.amount : 1000,
      interval: planData.interval || 'month',
      usage_type: planData.usage_type || 'licensed'
    })
    return owner
  },
  createOwnerWithUnpublishedPlan: async (planData) => {
    const owner = await TestHelper.createOwner()
    const product = await TestHelper.createProduct(owner, {
      published: true
    })
    planData = planData || {}
    await TestHelper.createPlan(owner, {
      productid: product.id,
      published: true,
      unpublished: 'true',
      trial_period_days: planData.trial_period_days !== undefined ? planData.trial_period_days : 0,
      amount: planData.amount !== undefined ? planData.amount : 1000,
      interval: planData.interval || 'month',
      usage_type: planData.usage_type || 'licensed'
    })
    return owner
  },
  createOwnerWithNotPublishedPlan: async (planData) => {
    const owner = await TestHelper.createOwner()
    const product = await TestHelper.createProduct(owner, {
      published: true
    })
    planData = planData || {}
    await TestHelper.createPlan(owner, {
      productid: product.id,
      trial_period_days: planData.trial_period_days !== undefined ? planData.trial_period_days : 0,
      amount: planData.amount !== undefined ? planData.amount : 1000,
      interval: planData.interval || 'month',
      usage_type: planData.usage_type || 'licensed'
    })
    return owner
  },
  createUserWithPaymentMethod: async (user) => {
    user = user || await TestHelper.createUser()
    await TestHelper.createCustomer(user, {
      email: user.profile.contactEmail,
      description: user.profile.firstName
    })
    await TestHelper.createPaymentMethod(user, {
      cvc: '111',
      number: '4111111111111111',
      exp_month: '1',
      exp_year: (new Date().getFullYear() + 1).toString().substring(2),
      name: user.profile.firstName + ' ' + user.profile.lastName,
      address_line1: '285 Fulton St',
      address_line2: 'Apt 893',
      address_city: 'New York',
      address_state: 'NY',
      address_zip: '10007',
      address_country: 'US',
      default: 'true'
    })
    return user
  }
}
