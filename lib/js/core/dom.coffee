diff_match_patch = (require "google-diff-match-patch-js").diff_match_patch

module.exports = class DomPredictionHelper
  recursiveNodes: (e) ->
    if e.nodeName && e.parentNode && e != document.body
      n = @recursiveNodes(e.parentNode)
    else
      n = new Array()
    n.push(e)
    n

  escapeCssNames: (name) ->
    if name
      try
        name.replace(/\bselectorgadget_\w+\b/g, '').replace(/\\/g, '\\\\').
             replace(/[\#\;\&\,\.\+\*\~\'\:\"\!\^\$\[\]\(\)\=\>\|\/]/g, (e) -> '\\' + e).replace(/\s+/, '')
      catch e
        if window.console
          console.log('---');
          console.log("exception in escapeCssNames");
          console.log(name);
          console.log('---');
        ''
    else
      ''

  childElemNumber: (elem) ->
    count = 0
    while elem.previousSibling && (elem = elem.previousSibling)
      count++ if elem.nodeType == 1
    count

  siblingsWithoutTextNodes: (e) ->
    nodes = e.parentNode.childNodes
    filtered_nodes = []
    for node in nodes
      continue if node.nodeName.substring(0, 1) == "#"
      break if node == e
      filtered_nodes.push node
    filtered_nodes

  pathOf: (elem) ->
    path = ""
    for e in @recursiveNodes(elem)
      if e
        siblings = @siblingsWithoutTextNodes(e)
        if e.nodeName.toLowerCase() != "body"
          # Only look at 2 previous siblings.
          j = if siblings.length - 2 < 0 then 0 else siblings.length - 2
          while j < siblings.length
            break if siblings[j] == e
            if !siblings[j].nodeName.match(/^(script|#.*?)$/i)
              path += @cssDescriptor(siblings[j], true) + (if j + 1 == siblings.length then "+ " else "~ ")
            j++
        path += @cssDescriptor(e) + " > "
    @cleanCss path

  cssDescriptor: (node, includeContents) ->
    path = node.nodeName.toLowerCase()
    escaped = node.id && @escapeCssNames(new String(node.id))
    path += '#' + escaped if escaped && escaped.length > 0

    if node.className
      for cssName in node.className.split(" ")
        escaped = @escapeCssNames(cssName)
        if cssName && escaped.length > 0
          path += '.' + escaped

    if includeContents && jQuerySG(node).contents().length < 5 # Not too many children.
      text = jQuerySG.trim(jQuerySG(node).text().replace(/\s+/g, ' '))
      if text.length < 35 && text.length > 4 && text.indexOf("\"") == -1
        path += ":contains(\"" + this.encodeContentString(text) + "\")"

    if node.nodeName.toLowerCase() != "body" # nth-child needs to be last.
      path += ':nth-child(' + (@childElemNumber(node) + 1) + ')'

    path

  encodeContentString: (str) ->
    str = str.replace(/\"/, '\\"')
    out = []
    for i in [0...str.length]
      out.push str.charCodeAt(i)
    out.join('-')

  decodeContentString: (str) ->
    parts = str.split('-')
    out = ""
    for i in [0...parts.length]
      out += String.fromCharCode(parseInt(parts[i]))
    out

  decodeAllContentStrings: (str) ->
    str.replace /:contains\(\"([\d\-]+)\"\)/gi, (s, substr) =>
      ":contains(\"" + @decodeContentString(substr) + "\")"

  cssDiff: (array) ->
    try
      dmp = new diff_match_patch()
    catch e
      throw "Please include the diff_match_patch library."

    return '' if typeof array == 'undefined' || array.length == 0

    existing_tokens = {}
    encoded_css_array = @encodeCssForDiff(array, existing_tokens)

    collective_common = encoded_css_array.pop()
    for cssElem in encoded_css_array
      diff = dmp.diff_main(collective_common, cssElem)
      collective_common = ''
      for part in diff
        collective_common += part[1] if part[0] == 0
    @decodeCss(collective_common, existing_tokens)

  tokenizeCss: (css_string) ->
    skip = false
    word = ''
    tokens = []

    for char in @cleanCss(css_string)
      if skip
        skip = false
      else if char == '\\'
        skip = true
      else if char == '.' || char == ' ' || char == '#' || char == '>' || char == ':' || char == ',' || char == '+' || char == '~'
        tokens.push(word) if word.length > 0
        word = ''
      word += char
      if char == ' ' || char == ','
        tokens.push word
        word = ''
    tokens.push(word) if word.length > 0
    tokens

  # Same as tokenizeCss, except that siblings are treated as single tokens.
  tokenizeCssForDiff: (css_string) ->
    combined_tokens = []
    block = []

    for token in @tokenizeCss(css_string)
      block.push token
      if token == ' ' && block.length > 0
        combined_tokens = combined_tokens.concat(block)
        block = []
      else if token == '+' || token == '~'
        block = [block.join('')]
    if block.length > 0
      combined_tokens.concat(block)
    else
      combined_tokens

  decodeCss: (string, existing_tokens) ->
    inverted = @invertObject(existing_tokens)
    out = '';
    for character in string.split('')
      out += inverted[character]
    @cleanCss out

  # Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
  encodeCssForDiff: (strings, existing_tokens) ->
    codepoint = 50
    strings_out = []
    for string in strings
      out = new String()
      for token in @tokenizeCssForDiff(string)
        unless existing_tokens[token]
          existing_tokens[token] = String.fromCharCode(codepoint++)
        out += existing_tokens[token]
      strings_out.push(out)
    strings_out

  tokenPriorities: (tokens) ->
    epsilon = 0.001
    priorities = new Array()
    i = 0
    for token in tokens
      first = token.substring(0, 1)
      second = token.substring(1, 2)
      if first == ':' && second == 'n' # :nth-child
        priorities[i] = 0
      else if first == ':' && second == 'c' # :contains
        priorities[i] = 1
      else if first == '>' # >
        priorities[i] = 2;
      else if first == '+' || first == '~' # + and ~
        priorities[i] = 3
      else if first != ':' && first != '.' && first != '#' && first != ' ' &&
              first != '>' && first != '+' && first != '~' # elem, etc.
          priorities[i] = 4
      else if first == '.' # classes
        priorities[i] = 5
      else if first = '#' # ids
        priorities[i] = 6
        if token.match(/\d{3,}/)
          priorities[i] = 2.5
      else
        priorities[i] = 0
      priorities[i] += i * epsilon
      i++
    priorities

  orderFromPriorities: (priorities) ->
    tmp = new Array()
    ordering = new Array()
    for i in [0...priorities.length]
      tmp[i] = { value: priorities[i], original: i }
    tmp.sort (a,b) -> a.value - b.value
    for i in [0...priorities.length]
      ordering[i] = tmp[i].original
    ordering;

  simplifyCss: (css, selected, rejected) ->
    parts = @tokenizeCss(css)
    priorities = @tokenPriorities(parts)
    ordering = @orderFromPriorities(priorities)
    selector = @decodeAllContentStrings(@cleanCss(css))
    look_back_index = -1
    best_so_far = ""
    best_so_far = selector if @selectorGets('all', selected, selector) && @selectorGets('none', rejected, selector)
    got_shorter = true
    while got_shorter
      got_shorter = false
      for i in [0...parts.length]
        part = ordering[i]

        continue if parts[part].length == 0
        first = parts[part].substring(0, 1)
        second = parts[part].substring(1, 2)
        continue if first == ' '
        continue if @wouldLeaveFreeFloatingNthChild(parts, part)

        @_removeElements part, parts, first, (selector) =>
          if @selectorGets('all', selected, selector) && @selectorGets('none', rejected, selector) &&
             (selector.length < best_so_far.length || best_so_far.length == 0)
            best_so_far = selector
            got_shorter = true
            true
          else
            false
    @cleanCss best_so_far

  # Remove some elements depending on whether this is a sibling selector or not, and put them back if the block returns false.
  _removeElements: (part, parts, firstChar, callback) ->
    if firstChar == '+' || firstChar == '~'
      look_back_index = @positionOfSpaceBeforeIndexOrLineStart(part, parts)
    else
      look_back_index = part

    tmp = parts.slice(look_back_index, part + 1) # Save a copy of these parts.
    for j in [look_back_index..part]
      parts[j] = '' # Clear it out.

    selector = @decodeAllContentStrings(@cleanCss(parts.join('')))

    if selector == '' || !callback(selector)
      for j in [look_back_index..part]
        parts[j] = tmp[j - look_back_index] # Put it back.

    parts

  positionOfSpaceBeforeIndexOrLineStart: (part, parts) ->
    i = part
    while i >= 0 && parts[i] != ' '
      i--
    i = 0 if i < 0
    i

  # Has to handle parts with zero length.
  wouldLeaveFreeFloatingNthChild: (parts, part) ->
    space_is_on_left = nth_child_is_on_right = false

    i = part + 1
    while i < parts.length && parts[i].length == 0
      i++
    nth_child_is_on_right = true if i < parts.length && parts[i].substring(0, 2) == ':n'

    i = part - 1
    while i > -1 && parts[i].length == 0
      i--
    space_is_on_left = true if i < 0 || parts[i] == ' '

    space_is_on_left && nth_child_is_on_right

  # Not intended for user CSS, does destructive sibling removal.  Expects strings to be escaped, such as in :contains.
  cleanCss: (css) ->
    cleaned_css = css
    last_cleaned_css = null
    while last_cleaned_css != cleaned_css
      last_cleaned_css = cleaned_css
      cleaned_css = cleaned_css.replace(/(^|\s+)(\+|\~)/, '').replace(/(\+|\~)\s*$/, '').replace(/>/g, ' > ').
                                replace(/\s*(>\s*)+/g, ' > ').replace(/,/g, ' , ').replace(/\s+/g, ' ').
                                replace(/^\s+|\s+$/g, '').replace(/\s*,$/g, '').replace(/^\s*,\s*/g, '').replace(/\s*>$/g, '').
                                replace(/^>\s*/g, '').replace(/[\+\~\>]\s*,/g, ',').replace(/[\+\~]\s*>/g, '>').replace(/\s*(,\s*)+/g, ' , ')
    cleaned_css

  # Takes wrapped
  getPathsFor: (nodeset) ->
    out = []
    for node in nodeset
      if node && node.nodeName
        out.push @pathOf(node)
    out

  # Takes wrapped
  predictCss: (s, r) ->
    return '' if s.length == 0
    selected_paths = @getPathsFor(s)
    css = @cssDiff(selected_paths)
    simplest = @simplifyCss(css, s, r)

    # Do we get off easy?
    return simplest if simplest.length > 0

    # Okay, then make a union and possibly try to reduce subsets.
    union = ''
    for selected in s
      union = @pathOf(selected) + ", " + union
    union = @cleanCss(union)

    @simplifyCss(union, s, r)

  # Assumes list is jQuery node-set.  Todo: There is room for memoization here.
  selectorGets: (type, list, the_selector) ->
    return false if list.length == 0 && type == 'all'
    return true if list.length == 0 && type == 'none'

    try
      if type == 'all'
        list.not(the_selector).length == 0
      else # none
        !(list.is(the_selector))
    catch e
      console.log("Error on selector: " + the_selector) if window.console
      throw e

  invertObject: (object) ->
    new_object = {}
    for key, value of object
      new_object[value] = key
    new_object

  cssToXPath: (css_string) ->
    tokens = @tokenizeCss(css_string)
    tokens.splice(0, 1) if tokens[0] && tokens[0] == ' '
    tokens.splice(tokens.length - 1, 1) if tokens[tokens.length - 1] && tokens[tokens.length - 1] == ' '

    css_block = []
    out = ""

    for token in tokens
      if token == ' '
        out += @cssToXPathBlockHelper(css_block)
        css_block = []
      else
        css_block.push token

    out + @cssToXPathBlockHelper(css_block)

  # Process a block (html entity, class(es), id, :nth-child()) of css
  cssToXPathBlockHelper: (css_block) ->
    return '//' if css_block.length == 0
    out = '//'
    first = css_block[0].substring(0,1)

    return " | " if first == ','

    out += '*' if first in [':', '#', '.']

    expressions = []
    re = null

    for current in css_block
      first = current.substring(0,1)
      rest = current.substring(1)

      if first == ':'
        # We only support :nth-child(n) at the moment.
        if re = rest.match(/^nth-child\((\d+)\)$/)
          expressions.push('(((count(preceding-sibling::*) + 1) = ' + re[1] + ') and parent::*)')
      else if first == '.'
        expressions.push('contains(concat( " ", @class, " " ), concat( " ", "' + rest + '", " " ))')
      else if first == '#'
        expressions.push('(@id = "' + rest + '")')
      else if first == ','
      else
        out += current

    out += '[' if expressions.length > 0
    for i in [0...expressions.length]
      out += expressions[i]
      out += ' and ' if i < expressions.length - 1
    out += ']' if expressions.length > 0
    out
