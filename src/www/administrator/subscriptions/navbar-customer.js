module.exports = {
  setup: (doc, customer) => {
    const template = doc.getElementById('navbar')
    if (customer.discount && customer.discount.coupon && customer.discount.coupon.id) {
      const applyCoupon = template.getElementById('navbar-apply-coupon')
      applyCoupon.parentNode.removeChild(applyCoupon)
    } else {
      const revokeCoupon = template.getElementById('navbar-revoke-coupon')
      revokeCoupon.parentNode.removeChild(revokeCoupon)
    }
  }
}
