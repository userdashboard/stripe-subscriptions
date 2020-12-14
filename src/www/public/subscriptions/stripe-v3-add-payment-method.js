let cardNumber
let stripe
const stripeElements = []
window.onload = function () {
  const stripePublishableKey = document.getElementById('stripe-publishable-key')
  stripe = window.Stripe(stripePublishableKey.value)
  const elements = stripe.elements()
  const style = {
    base: {
      color: '#666666',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#EEEEEE'
      }
    },
    invalid: {
      color: '#990000',
      iconColor: '#fa755a'
    }
  }
  const zipNumber = elements.create('postalCode', { style: style })
  zipNumber.mount('#zip-container')
  const cvcNumber = elements.create('cardCvc', { style: style })
  cvcNumber.mount('#cvc-container')
  const expiryNumber = elements.create('cardExpiry', { style: style })
  expiryNumber.mount('#expiry-container')
  cardNumber = elements.create('cardNumber', { style: style })
  cardNumber.mount('#card-container')
  stripeElements.push(zipNumber, cvcNumber, expiryNumber, cardNumber)
  const submit = document.getElementById('submit-button')
  submit.addEventListener('click', convertCard)
  window.loaded = true
}

function convertCard (e) {
  e.preventDefault()
  const additionalData = {}
  const fields = ['name', 'address_line1', 'address_line2', 'address_city', 'address_state', 'address_country']
  for (let i = 0, len = fields.length; i < len; i++) {
    const input = document.getElementById(fields[i])
    if (input.value) {
      additionalData[fields[i]] = input.value
    }
  }
  return stripe.createToken(cardNumber, additionalData).then(function (result) {
    if (result.error) {
      const errorElement = document.getElementById('card-errors')
      errorElement.textContent = result.error.message
      return
    }
    const token = document.getElementById('token')
    token.value = result.token.id
    const form = document.getElementById('form-stripejs-v3')
    return form.submit()
  })
}
