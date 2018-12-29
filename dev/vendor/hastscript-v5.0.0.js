var _$trim_23 = {};

_$trim_23 = _$trim_23 = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

_$trim_23.left = function(str){
  return str.replace(/^\s*/, '');
};

_$trim_23.right = function(str){
  return str.replace(/\s*$/, '');
};

var _$commaSeparatedTokens_1 = {};
'use strict'

_$commaSeparatedTokens_1.parse = parse
_$commaSeparatedTokens_1.stringify = stringify

/* removed: var _$trim_23 = require('trim') */;

var comma = ','
var space = ' '
var empty = ''

/* Parse comma-separated tokens to an array. */
function parse(value) {
  var values = []
  var input = String(value || empty)
  var index = input.indexOf(comma)
  var lastIndex = 0
  var end = false
  var val

  while (!end) {
    if (index === -1) {
      index = input.length
      end = true
    }

    val = _$trim_23(input.slice(lastIndex, index))

    if (val || !end) {
      values.push(val)
    }

    lastIndex = index + 1
    index = input.indexOf(comma, lastIndex)
  }

  return values
}

/* Compile an array to comma-separated tokens.
 * `options.padLeft` (default: `true`) pads a space left of each
 * token, and `options.padRight` (default: `false`) pads a space
 * to the right of each token. */
function stringify(values, options) {
  var settings = options || {}
  var left = settings.padLeft === false ? empty : space
  var right = settings.padRight ? space : empty

  /* Ensure the last empty entry is seen. */
  if (values[values.length - 1] === empty) {
    values = values.concat(empty)
  }

  return _$trim_23(values.join(right + comma + left))
}

'use strict'

var _$parse_2 = __parse_2

var dot = '.'.charCodeAt(0)
var hash = '#'.charCodeAt(0)

/* Parse a simple CSS selector into a HAST node. */
function __parse_2(selector, defaultTagName) {
  var value = selector || ''
  var name = defaultTagName || 'div'
  var props = {}
  var index = -1
  var length = value.length
  var className
  var type
  var code
  var subvalue
  var lastIndex

  while (++index <= length) {
    code = value.charCodeAt(index)

    if (!code || code === dot || code === hash) {
      subvalue = value.slice(lastIndex, index)

      if (subvalue) {
        if (type === dot) {
          if (className) {
            className.push(subvalue)
          } else {
            className = [subvalue]
            props.className = className
          }
        } else if (type === hash) {
          props.id = subvalue
        } else {
          name = subvalue
        }
      }

      lastIndex = index + 1
      type = code
    }
  }

  return {
    type: 'element',
    tagName: name,
    properties: props,
    children: []
  }
}

'use strict'

var _$Info_14 = Info

var proto = Info.prototype

proto.space = null
proto.attribute = null
proto.property = null
proto.boolean = false
proto.booleanish = false
proto.overloadedBoolean = false
proto.number = false
proto.commaSeparated = false
proto.spaceSeparated = false
proto.commaOrSpaceSeparated = false
proto.mustUseProperty = false
proto.defined = false

function Info(property, attribute) {
  this.property = property
  this.attribute = attribute
}

var _$types_17 = {};
'use strict'

var powers = 0

_$types_17.boolean = increment()
_$types_17.booleanish = increment()
_$types_17.overloadedBoolean = increment()
_$types_17.number = increment()
_$types_17.spaceSeparated = increment()
_$types_17.commaSeparated = increment()
_$types_17.commaOrSpaceSeparated = increment()

function increment() {
  return Math.pow(2, ++powers)
}

'use strict'

/* removed: var _$Info_14 = require('./info') */;
/* removed: var _$types_17 = require('./types') */;

var _$DefinedInfo_13 = DefinedInfo

DefinedInfo.prototype = new _$Info_14()
DefinedInfo.prototype.defined = true

function DefinedInfo(property, attribute, mask, space) {
  mark(this, 'space', space)
  _$Info_14.call(this, property, attribute)
  mark(this, 'boolean', check(mask, _$types_17.boolean))
  mark(this, 'booleanish', check(mask, _$types_17.booleanish))
  mark(this, 'overloadedBoolean', check(mask, _$types_17.overloadedBoolean))
  mark(this, 'number', check(mask, _$types_17.number))
  mark(this, 'commaSeparated', check(mask, _$types_17.commaSeparated))
  mark(this, 'spaceSeparated', check(mask, _$types_17.spaceSeparated))
  mark(this, 'commaOrSpaceSeparated', check(mask, _$types_17.commaOrSpaceSeparated))
}

function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}

function check(value, mask) {
  return (value & mask) === mask
}

'use strict'

var _$normalize_21 = normalize

function normalize(value) {
  return value.toLowerCase()
}

'use strict'

/* removed: var _$normalize_21 = require('./normalize') */;
/* removed: var _$DefinedInfo_13 = require('./lib/util/defined-info') */;
/* removed: var _$Info_14 = require('./lib/util/info') */;

var data = 'data'

var _$find_6 = find

var valid = /^data[-a-z0-9.:_]+$/i
var dash = /-[a-z]/g
var cap = /[A-Z]/g

function find(schema, value) {
  var normal = _$normalize_21(value)
  var prop = value
  var Type = _$Info_14

  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]]
  }

  if (normal.length > 4 && normal.slice(0, 4) === data && valid.test(value)) {
    // Attribute or property.
    if (value.charAt(4) === '-') {
      prop = datasetToProperty(value)
    } else {
      value = datasetToAttribute(value)
    }

    Type = _$DefinedInfo_13
  }

  return new Type(prop, value)
}

function datasetToProperty(attribute) {
  var value = attribute.slice(5).replace(dash, camelcase)
  return data + value.charAt(0).toUpperCase() + value.slice(1)
}

function datasetToAttribute(property) {
  var value = property.slice(4)

  if (dash.test(value)) {
    return property
  }

  value = value.replace(cap, kebab)

  if (value.charAt(0) !== '-') {
    value = '-' + value
  }

  return data + value
}

function kebab($0) {
  return '-' + $0.toLowerCase()
}

function camelcase($0) {
  return $0.charAt(1).toUpperCase()
}

var _$spaceSeparatedTokens_22 = {};
'use strict'

/* removed: var _$trim_23 = require('trim') */;

_$spaceSeparatedTokens_22.parse = __parse_22
_$spaceSeparatedTokens_22.stringify = __stringify_22

var __empty_22 = ''
var __space_22 = ' '
var whiteSpace = /[ \t\n\r\f]+/g

function __parse_22(value) {
  var input = _$trim_23(String(value || __empty_22))
  return input === __empty_22 ? [] : input.split(whiteSpace)
}

function __stringify_22(values) {
  return _$trim_23(values.join(__space_22))
}

'use strict'

/* removed: var _$find_6 = require('property-information/find') */;
/* removed: var _$normalize_21 = require('property-information/normalize') */;
/* removed: var _$parse_2 = require('hast-util-parse-selector') */;
var spaces = _$spaceSeparatedTokens_22.parse
var commas = _$commaSeparatedTokens_1.parse

var _$factory_3 = factory

function factory(schema, defaultTagName) {
  return h

  /* Hyperscript compatible DSL for creating virtual HAST trees. */
  function h(selector, properties) {
    var node = _$parse_2(selector, defaultTagName)
    var children = Array.prototype.slice.call(arguments, 2)
    var property

    if (properties && isChildren(properties, node)) {
      children.unshift(properties)
      properties = null
    }

    if (properties) {
      for (property in properties) {
        addProperty(node.properties, property, properties[property])
      }
    }

    addChild(node.children, children)

    if (node.tagName === 'template') {
      node.content = {type: 'root', children: node.children}
      node.children = []
    }

    return node
  }

  function addProperty(properties, key, value) {
    var info
    var property
    var result

    /* Ignore nully and NaN values. */
    if (value === null || value === undefined || value !== value) {
      return
    }

    info = _$find_6(schema, key)
    property = info.property
    result = value

    /* Handle list values. */
    if (typeof result === 'string') {
      if (info.spaceSeparated) {
        result = spaces(result)
      } else if (info.commaSeparated) {
        result = commas(result)
      } else if (info.commaOrSpaceSeparated) {
        result = spaces(commas(result).join(' '))
      }
    }

    /* Accept `object` on style. */
    if (property === 'style' && typeof value !== 'string') {
      result = style(result)
    }

    /* Class-names (which can be added both on the `selector` and here). */
    if (property === 'className' && properties.className) {
      result = properties.className.concat(result)
    }

    properties[property] = parsePrimitives(info, property, result)
  }
}

function isChildren(value, node) {
  return (
    typeof value === 'string' ||
    'length' in value ||
    isNode(node.tagName, value)
  )
}

function isNode(tagName, value) {
  var type = value.type

  if (tagName === 'input' || !type || typeof type !== 'string') {
    return false
  }

  if (typeof value.children === 'object' && 'length' in value.children) {
    return true
  }

  type = type.toLowerCase()

  if (tagName === 'button') {
    return (
      type !== 'menu' &&
      type !== 'submit' &&
      type !== 'reset' &&
      type !== 'button'
    )
  }

  return 'value' in value
}

function addChild(nodes, value) {
  var index
  var length

  if (typeof value === 'string' || typeof value === 'number') {
    nodes.push({type: 'text', value: String(value)})
    return
  }

  if (typeof value === 'object' && 'length' in value) {
    index = -1
    length = value.length

    while (++index < length) {
      addChild(nodes, value[index])
    }

    return
  }

  if (typeof value !== 'object' || !('type' in value)) {
    throw new Error('Expected node, nodes, or string, got `' + value + '`')
  }

  nodes.push(value)
}

/* Parse a (list of) primitives. */
function parsePrimitives(info, name, value) {
  var index
  var length
  var result

  if (typeof value !== 'object' || !('length' in value)) {
    return parsePrimitive(info, name, value)
  }

  length = value.length
  index = -1
  result = []

  while (++index < length) {
    result[index] = parsePrimitive(info, name, value[index])
  }

  return result
}

/* Parse a single primitives. */
function parsePrimitive(info, name, value) {
  var result = value

  if (info.number || info.positiveNumber) {
    if (!isNaN(result) && result !== '') {
      result = Number(result)
    }
  } else if (info.boolean || info.overloadedBoolean) {
    /* Accept `boolean` and `string`. */
    if (
      typeof result === 'string' &&
      (result === '' || _$normalize_21(value) === _$normalize_21(name))
    ) {
      result = true
    }
  }

  return result
}

function style(value) {
  var result = []
  var key

  for (key in value) {
    result.push([key, value[key]].join(': '))
  }

  return result.join('; ')
}

'use strict'

var _$Schema_16 = Schema

var __proto_16 = Schema.prototype

__proto_16.space = null
__proto_16.normal = {}
__proto_16.property = {}

function Schema(property, normal, space) {
  this.property = property
  this.normal = normal

  if (space) {
    this.space = space
  }
}

'use strict'

/* removed: var _$normalize_21 = require('../../normalize') */;
/* removed: var _$Schema_16 = require('./schema') */;
/* removed: var _$DefinedInfo_13 = require('./defined-info') */;

var _$create_12 = create

function create(definition) {
  var space = definition.space
  var mustUseProperty = definition.mustUseProperty || []
  var attributes = definition.attributes || {}
  var props = definition.properties
  var transform = definition.transform
  var property = {}
  var normal = {}
  var prop
  var info

  for (prop in props) {
    info = new _$DefinedInfo_13(
      prop,
      transform(attributes, prop),
      props[prop],
      space
    )

    if (mustUseProperty.indexOf(prop) !== -1) {
      info.mustUseProperty = true
    }

    property[prop] = info

    normal[_$normalize_21(prop)] = prop
    normal[_$normalize_21(info.attribute)] = prop
  }

  return new _$Schema_16(property, normal, space)
}

'use strict'

/* removed: var _$types_17 = require('./util/types') */;
/* removed: var _$create_12 = require('./util/create') */;

var booleanish = _$types_17.booleanish
var number = _$types_17.number
var spaceSeparated = _$types_17.spaceSeparated

var _$aria_8 = _$create_12({
  transform: ariaTransform,
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  }
})

function ariaTransform(_, prop) {
  return prop === 'role' ? prop : 'aria-' + prop.slice(4).toLowerCase()
}

'use strict'

var _$caseSensitiveTransform_11 = caseSensitiveTransform

function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute
}

'use strict'

/* removed: var _$caseSensitiveTransform_11 = require('./case-sensitive-transform') */;

var _$caseInsensitiveTransform_10 = caseInsensitiveTransform

function caseInsensitiveTransform(attributes, property) {
  return _$caseSensitiveTransform_11(attributes, property.toLowerCase())
}

'use strict'

/* removed: var _$types_17 = require('./util/types') */;
/* removed: var _$create_12 = require('./util/create') */;
/* removed: var _$caseInsensitiveTransform_10 = require('./util/case-insensitive-transform') */;

var boolean = _$types_17.boolean
var overloadedBoolean = _$types_17.overloadedBoolean
var __booleanish_9 = _$types_17.booleanish
var __number_9 = _$types_17.number
var __spaceSeparated_9 = _$types_17.spaceSeparated
var commaSeparated = _$types_17.commaSeparated

var _$html_9 = _$create_12({
  space: 'html',
  attributes: {
    acceptcharset: 'accept-charset',
    classname: 'class',
    htmlfor: 'for',
    httpequiv: 'http-equiv'
  },
  transform: _$caseInsensitiveTransform_10,
  mustUseProperty: ['checked', 'multiple', 'muted', 'selected'],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: __spaceSeparated_9,
    accessKey: __spaceSeparated_9,
    action: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: __spaceSeparated_9,
    autoFocus: boolean,
    autoPlay: boolean,
    capture: boolean,
    charSet: null,
    checked: boolean,
    cite: null,
    className: __spaceSeparated_9,
    cols: __number_9,
    colSpan: null,
    content: null,
    contentEditable: __booleanish_9,
    controls: boolean,
    controlsList: __spaceSeparated_9,
    coords: __number_9 | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: __booleanish_9,
    encType: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: __spaceSeparated_9,
    height: __number_9,
    hidden: boolean,
    high: __number_9,
    href: null,
    hrefLang: null,
    htmlFor: __spaceSeparated_9,
    httpEquiv: __spaceSeparated_9,
    id: null,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: __spaceSeparated_9,
    itemRef: __spaceSeparated_9,
    itemScope: boolean,
    itemType: __spaceSeparated_9,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loop: boolean,
    low: __number_9,
    manifest: null,
    max: null,
    maxLength: __number_9,
    media: null,
    method: null,
    min: null,
    minLength: __number_9,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    open: boolean,
    optimum: __number_9,
    pattern: null,
    ping: __spaceSeparated_9,
    placeholder: null,
    playsInline: boolean,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: __spaceSeparated_9,
    required: boolean,
    reversed: boolean,
    rows: __number_9,
    rowSpan: __number_9,
    sandbox: __spaceSeparated_9,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shape: null,
    size: __number_9,
    sizes: null,
    slot: null,
    span: __number_9,
    spellCheck: __booleanish_9,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: commaSeparated,
    start: __number_9,
    step: null,
    style: null,
    tabIndex: __number_9,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: __booleanish_9,
    width: __number_9,
    wrap: null,

    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null, // Several. Use CSS `text-align` instead,
    aLink: null, // `<body>`. Use CSS `a:active {color}` instead
    archive: __spaceSeparated_9, // `<object>`. List of URIs to archives
    axis: null, // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null, // `<body>`. Use CSS `background-image` instead
    bgColor: null, // `<body>` and table elements. Use CSS `background-color` instead
    border: __number_9, // `<table>`. Use CSS `border-width` instead,
    borderColor: null, // `<table>`. Use CSS `border-color` instead,
    bottomMargin: __number_9, // `<body>`
    cellPadding: null, // `<table>`
    cellSpacing: null, // `<table>`
    char: null, // Several table elements. When `align=char`, sets the character to align on
    charOff: null, // Several table elements. When `char`, offsets the alignment
    classId: null, // `<object>`
    clear: null, // `<br>`. Use CSS `clear` instead
    code: null, // `<object>`
    codeBase: null, // `<object>`
    codeType: null, // `<object>`
    color: null, // `<font>` and `<hr>`. Use CSS instead
    compact: boolean, // Lists. Use CSS to reduce space between items instead
    declare: boolean, // `<object>`
    event: null, // `<script>`
    face: null, // `<font>`. Use CSS instead
    frame: null, // `<table>`
    frameBorder: null, // `<iframe>`. Use CSS `border` instead
    hSpace: __number_9, // `<img>` and `<object>`
    leftMargin: __number_9, // `<body>`
    link: null, // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null, // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null, // `<img>`. Use a `<picture>`
    marginHeight: __number_9, // `<body>`
    marginWidth: __number_9, // `<body>`
    noResize: boolean, // `<frame>`
    noHref: boolean, // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean, // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean, // `<td>` and `<th>`
    object: null, // `<applet>`
    profile: null, // `<head>`
    prompt: null, // `<isindex>`
    rev: null, // `<link>`
    rightMargin: __number_9, // `<body>`
    rules: null, // `<table>`
    scheme: null, // `<meta>`
    scrolling: __booleanish_9, // `<frame>`. Use overflow in the child context
    standby: null, // `<object>`
    summary: null, // `<table>`
    text: null, // `<body>`. Use CSS `color` instead
    topMargin: __number_9, // `<body>`
    valueType: null, // `<param>`
    version: null, // `<html>`. Use a doctype.
    vAlign: null, // Several. Use CSS `vertical-align` instead
    vLink: null, // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: __number_9, // `<img>` and `<object>`

    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    prefix: null,
    property: null,
    results: __number_9,
    security: null,
    unselectable: null
  }
})

var _$extend_24 = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

'use strict'

/* removed: var _$extend_24 = require('xtend') */;
/* removed: var _$Schema_16 = require('./schema') */;

var _$merge_15 = merge

function merge(definitions) {
  var length = definitions.length
  var property = []
  var normal = []
  var index = -1
  var info
  var space

  while (++index < length) {
    info = definitions[index]
    property.push(info.property)
    normal.push(info.normal)
    space = info.space
  }

  return new _$Schema_16(
    _$extend_24.apply(null, property),
    _$extend_24.apply(null, normal),
    space
  )
}

'use strict'

/* removed: var _$create_12 = require('./util/create') */;

var _$xlink_18 = _$create_12({
  space: 'xlink',
  transform: xlinkTransform,
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  }
})

function xlinkTransform(_, prop) {
  return 'xlink:' + prop.slice(5).toLowerCase()
}

'use strict'

/* removed: var _$create_12 = require('./util/create') */;

var _$xml_19 = _$create_12({
  space: 'xml',
  transform: xmlTransform,
  properties: {
    xmlLang: null,
    xmlBase: null,
    xmlSpace: null
  }
})

function xmlTransform(_, prop) {
  return 'xml:' + prop.slice(3).toLowerCase()
}

'use strict'

/* removed: var _$create_12 = require('./util/create') */;
/* removed: var _$caseInsensitiveTransform_10 = require('./util/case-insensitive-transform') */;

var _$xmlns_20 = _$create_12({
  space: 'xmlns',
  attributes: {
    xmlnsxlink: 'xmlns:xlink'
  },
  transform: _$caseInsensitiveTransform_10,
  properties: {
    xmlns: null,
    xmlnsXLink: null
  }
})

'use strict'

/* removed: var _$merge_15 = require('./lib/util/merge') */;
/* removed: var _$xlink_18 = require('./lib/xlink') */;
/* removed: var _$xml_19 = require('./lib/xml') */;
/* removed: var _$xmlns_20 = require('./lib/xmlns') */;
/* removed: var _$aria_8 = require('./lib/aria') */;
/* removed: var _$html_9 = require('./lib/html') */;

var _$html_7 = _$merge_15([_$xml_19, _$xlink_18, _$xmlns_20, _$aria_8, _$html_9])

'use strict'

/* removed: var _$html_7 = require('property-information/html') */;
/* removed: var _$factory_3 = require('./factory') */;

var __html_4 = _$factory_3(_$html_7, 'div')
__html_4.displayName = 'html'

var _$html_4 = __html_4

var _$hastscript_5 = {};
'use strict';

var module = {
  exports: {}
};
var exports = module.exports;
module.exports = _$html_4;
export default module.exports;

