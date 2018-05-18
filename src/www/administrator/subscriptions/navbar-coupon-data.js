module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  if (req.data.coupon.deleted) {
    doc.removeElementsById(['navbar-edit-link', 'navbar-delete-link'])
  } else {
    doc.removeElementById('navbar-restore-link')
  }
}
