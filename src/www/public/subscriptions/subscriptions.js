var lastHighlight
window.renderError = function (templateid) {
  var template = document.getElementById(templateid)
  if (!template) {
    throw new Error('unknown template ' + templateid)
  }
  if (lastHighlight) {
    delete (lastHighlight.style.borderColor)
  }
  if (templateid.indexOf('invalid-') === 0) {
    var field = templateid.substring('invalid-'.length)
    var highlight = document.getElementById(field)
    if (highlight) {
      lastHighlight = highlight
      highlight.style.borderColor = '#F00'
      document.location.hash = '#' + field + '-anchor'
    }
  }
  var messageContainer = document.getElementById('message-container')
  messageContainer.innerHTML = ''
  var node = document.importNode(template.content, true)
  messageContainer.appendChild(node)
  messageContainer.firstChild.setAttribute('template', templateid)
}
