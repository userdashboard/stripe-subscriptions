module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  doc.renderNavigation(doc, req.data.coupon)
  const navbarTemplate = doc.getElementById('navbar-template')
  if (req.data.coupon.metadata.published) {
    navbarTemplate.removeElementById('navbar-publish-link')
  } else {
    navbarTemplate.removeElementById('navbar-unpublish-link')
  }
}
