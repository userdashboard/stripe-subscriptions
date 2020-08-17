/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/usage-record-summaries', () => {
  describe('exceptions', () => {
    describe('invalid-subscriptionitemid', () => {
      it('missing querystring subscriptionitemid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/usage-record-summaries')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionitemid')
      })

      it('invalid querystring subscriptionitemid', async () => {
        // TODO: this test needs to verify ownership of the
        // subscriptionitemid after they are indexed
      })
    })
  })

  describe('receives', () => {
    it('optional querystring starting_after (string)', async () => {
      // TODO: this test needs to cause multiple usage summaries
    })

    it('optional querystring ending_before (string)', async () => {
      // TODO: this test needs to cause multiple usage summaries
    })

    it('optional querystring limit (integer)', async () => {
      // TODO: this test needs to cause multiple usage summaries
    })
  })

  describe('returns', () => {
    it('stripe list response', async () => {
      // TODO: this test needs to cause multiple usage summaries
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      // TODO: this test needs to cause multiple usage summaries
    })
  })
})
