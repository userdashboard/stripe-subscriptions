module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  doc.renderNavigation(req.data.subscription)
  const template = doc.getElementById('navbar-template')
  switch (req.urlPath) {
    case 'confirm-change-plan':
      return template.removeElementsById(['navbar-change-plan-link', 'navbar-confirm-plan-change-card-link'])
    case 'confirm-plan-change-card':
      return template.removeElementsById(['navbar-change-plan-link', 'navbar-confirm-change-plan-link'])
    default:
      return template.removeElementsById(['navbar-confirm-change-plan-link', 'navbar-confirm-plan-change-card-link'])
  }
}
