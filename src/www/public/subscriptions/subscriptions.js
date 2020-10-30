let lastHighlight
window.renderError = function (templateid) {
  const template = document.getElementById(templateid)
  if (!template) {
    throw new Error('unknown template ' + templateid)
  }
  if (lastHighlight) {
    delete (lastHighlight.style.borderColor)
  }
  if (templateid.indexOf('invalid-') === 0) {
    const field = templateid.substring('invalid-'.length)
    const highlight = document.getElementById(field)
    if (highlight) {
      lastHighlight = highlight
      highlight.style.borderColor = '#F00'
      document.location.hash = '#' + field + '-anchor'
    }
  }
  const messageContainer = document.getElementById('message-container')
  messageContainer.innerHTML = ''
  const node = document.importNode(template.content, true)
  messageContainer.appendChild(node)
  messageContainer.firstChild.setAttribute('template', templateid)
}
