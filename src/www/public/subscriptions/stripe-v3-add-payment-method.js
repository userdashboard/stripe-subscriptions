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
  var submit = document.getElementById('submit-button')
  submit.addEventListener('click', convertCard)
  window.loaded = true
}

function convertCard (e) {
  e.preventDefault()
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
      var errorElement = document.getElementById('card-errors')
      errorElement.textContent = result.error.message
      return
    }
    var token = document.getElementById('token')
    token.value = result.token.id
    var form = document.getElementById('form-stripejs-v3')
    return form.submit()
  })
}
