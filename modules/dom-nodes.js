export function sanitizeNode (node) {
  return inflateNode(deflateNode(node))
}

export function deflateNode (node) {
  let {nodeName, textContent} = node

  if (nodeName.toLowerCase() === 'iframe') {
    throw new Error('Commands are not allowed to render iframes')
  }

  let attributes = []
  let childNodes = []

  for (let child of node.childNodes) {
    childNodes.push(deflateNode(child))
  }

  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      let {name, value} = node.attributes[i]
      if (ignoreAttribute(name)) continue
      attributes.push({name, value})
    }
  }

  return {nodeName, textContent, attributes, childNodes}
}

export function inflateNode (tree) {
  if (tree.nodeName === '#text') {
    return document.createTextNode(tree.textContent)
  }

  let attr, child, el = document.createElement(tree.nodeName)

  for (attr of tree.attributes) {
    el.setAttribute(attr.name, attr.value)
  }
  for (child of tree.childNodes) {
    el.appendChild(inflateNode(child))
  }
  return el
}

function ignoreAttribute (name) {
  return name === 'style'
}
