/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/subscriptions/create-billing-profile', function () {
  this.timeout(20 * 60 * 1000)
  describe('view', () => {
    it('should present the form for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('stripe-v2'), undefined)
      assert.strictEqual(doc.getElementById('client-v2'), undefined)
      assert.strictEqual(doc.getElementById('stripe-v3'), undefined)
      assert.strictEqual(doc.getElementById('handler-v3'), undefined)
      assert.strictEqual(doc.getElementById('form-stripejs-v3'), undefined)
      assert.strictEqual(doc.getElementById('form-no-js').tag, 'form')
      assert.strictEqual(doc.getElementById('number').tag, 'input')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should present the form for stripe.js v3', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('stripe-v2'), undefined)
      assert.strictEqual(doc.getElementById('client-v2'), undefined)
      assert.strictEqual(doc.getElementById('stripe-v3').tag, 'script')
      assert.strictEqual(doc.getElementById('handler-v3').tag, 'script')
      assert.strictEqual(doc.getElementById('form-no-js'), undefined)
      assert.strictEqual(doc.getElementById('form-stripejs-v3').tag, 'form')
      assert.strictEqual(doc.getElementById('number'), undefined)
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should require description for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: '',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-description')
    })

    it('should require email for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        email: '',
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-email')
    })

    it('should require name for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
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
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-name')
    })

    it('should require CVC for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
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
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-cvc')
    })

    it('should require card number for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
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
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-number')
    })

    it('should require expiration month for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
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
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-exp_month')
    })

    it('should require expiration year for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
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
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-exp_year')
    })

    it('should require description for stripe.js v3', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.waitAfter = async (page) => {
        while (true) {
          try {
            const loaded = await page.evaluate(() => {
              return document.getElementById('message-container').children.length
            })
            if (loaded) {
              break
            }
          } catch (error) {
          }
          await page.waitForTimeout(100)
        }
      }
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: '',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        'cvc-container': '111',
        'card-container': '4111111111111111',
        'expiry-container': '12' + ((new Date().getFullYear() + 1).toString()).substring(2),
        address_line1: '285 Fulton St',
        address_line2: 'Apt 893',
        address_city: 'New York',
        address_state: 'NY',
        'zip-container': '10007',
        address_country: 'US'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-description')
    })

    it('should require email for stripe.js v3', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      req.waitAfter = async (page) => {
        while (true) {
          try {
            const loaded = await page.evaluate(() => {
              return document.getElementById('message-container').children.length
            })
            if (loaded) {
              break
            }
          } catch (error) {
          }
          await page.waitForTimeout(100)
        }
      }
      req.body = {
        email: '',
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        'cvc-container': '111',
        'card-container': '4111111111111111',
        'expiry-container': '12' + ((new Date().getFullYear() + 1).toString()).substring(2),
        address_line1: '285 Fulton St',
        address_line2: 'Apt 893',
        address_city: 'New York',
        address_state: 'NY',
        'zip-container': '10007',
        address_country: 'US'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-email')
    })

    it('should create billing profile for no stripe.js', async () => {
      global.stripeJS = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2)
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/account/subscriptions')
    })

    it('should create billing profile for stripe.js v3 (screenshots)', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/create-billing-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'description',
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        'cvc-container': '111',
        'card-container': '4111111111111111',
        'expiry-container': '12' + ((new Date().getFullYear() + 1).toString()).substring(2),
        address_line1: '285 Fulton St',
        address_line2: 'Apt 893',
        address_city: 'New York',
        address_state: 'NY',
        'zip-container': '10007',
        address_country: 'US'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/subscriptions' },
        { click: '/account/subscriptions/billing-profiles' },
        { click: '/account/subscriptions/create-billing-profile' },
        {
          fill: '#submit-form',
          waitAfter: async (page) => {
            while (true) {
              try {
                const location = await page.url()
                if (location.endsWith('/account/subscriptions')) {
                  return
                }
              } catch (error) {
              }
              await page.waitForTimeout(100)
            }
          }
        }
      ]
      const result = await req.post()
      assert.strictEqual(result.redirect, '/account/subscriptions')
    })
  })
})
