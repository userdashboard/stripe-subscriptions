/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/edit-payment-information`, async () => {
  describe('EditPaymentInformation#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submitForm'))
        assert.notEqual(null, doc.getElementById('submitButton'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('EditPaymentInformation#POST', () => {
    it('should require name', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: null,
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-name', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should require CVC', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: 0,
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-cvc', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should require card number', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: '123',
        number: null,
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-number', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should require expiration month', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: '123',
        number: '4111111111111111',
        exp_month: null,
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-exp_month', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should require expiration year', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: '123',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: null
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-exp_year', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should apply after authorization', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/subscriptions/edit-payment-information`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
