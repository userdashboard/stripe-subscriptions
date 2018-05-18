module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  doc.renderTemplate(null, 'navbar-html-template', 'navbar-template')
}
