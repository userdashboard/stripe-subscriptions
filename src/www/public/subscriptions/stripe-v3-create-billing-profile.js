var cardNumber
var stripe
var stripeElements = []
window.onload = function () {
  stripe = window.Stripe(window.stripePublishableKey)
  var elements = stripe.elements()
  var style = {
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
  var zipNumber = elements.create('postalCode', { style: style })
  zipNumber.mount('#zip-container')
  var cvcNumber = elements.create('cardCvc', { style: style })
  cvcNumber.mount('#cvc-container')
  var expiryNumber = elements.create('cardExpiry', { style: style })
  expiryNumber.mount('#expiry-container')
  cardNumber = elements.create('cardNumber', { style: style })
  cardNumber.mount('#card-container')
  stripeElements.push(zipNumber, cvcNumber, expiryNumber, cardNumber)
  var submit = document.getElementById('form-stripejs-v3')
  submit.addEventListener('submit', convertCard)
  window.loaded = true
}

function convertCard (e) {
  e.preventDefault()
  var description = document.getElementById('description')
  if (!description.value) {
    window.renderError('invalid-description')
    window.submitted = true
    return
  }
  var email = document.getElementById('email')
  if (!email.value) {
    window.renderError('invalid-email')
    window.submitted = true
    return
  }
  var additionalData = {}
  var fields = ['name', 'address_line1', 'address_line2', 'address_city', 'address_state', 'address_country']
  for (var i = 0, len = fields.length; i < len; i++) {
    var input = document.getElementById(fields[i])
    if (input.value) {
      additionalData[fields[i]] = input.value
    }
  }
  return stripe.createToken(cardNumber, additionalData).then(function (result) {
    if (result.error) {
      var errorElement = document.getElementById('message-container')
      errorElement.textContent = result.error.message
      window.submitted = true
      return
    }
    var token = document.getElementById('token')
    token.value = result.token.id
    var form = document.getElementById('form-stripejs-v3')
    form.submit()
    window.submitted = true
  })
}
