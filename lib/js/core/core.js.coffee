###
 The MIT License

 Copyright (c) 2012 Andrew Cantino
 Copyright (c) 2009 Andrew Cantino & Kyle Maxwell

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
###

window.SelectorGadget = class SelectorGadget
  border_width: 5
  border_padding: 2
  b_top: null
  b_left: null
  b_right: null
  b_bottom: null
  selected: []
  rejected: []
  special_mode: null
  path_output_field: null
  sg_div: null
  ignore_class: 'selectorgadget_ignore'
  unbound: false
  prediction_helper: new DomPredictionHelper()
  restricted_elements: jQuerySG.map(['html', 'body', 'head', 'base'], (selector) -> jQuerySG(selector).get(0))
  
  makeBorders: (orig_elem, makeRed) ->
    @removeBorders()
    @setupBorders()
  
    if orig_elem.parentNode
      path_to_show = orig_elem.parentNode.tagName.toLowerCase() + ' ' + orig_elem.tagName.toLowerCase()
    else
      path_to_show = orig_elem.tagName.toLowerCase()
  
    elem = jQuerySG(orig_elem)
    p = elem.offset()
  
    top = p.top
    left = p.left
    width = elem.outerWidth()
    height = elem.outerHeight()
  
    @b_top.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2)).
           css('top', this.px(top - this.border_width - this.border_padding)).
           css('left', this.px(left - this.border_padding - this.border_width))
    @b_bottom.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2 - 5)).
              css('top', this.px(top + height + this.border_padding)).
              css('left', this.px(left - this.border_padding - this.border_width)).text(path_to_show)
    @b_left.css('height', this.px(height + this.border_padding * 2)).
            css('top', this.px(top - this.border_padding)).
            css('left', this.px(left - this.border_padding - this.border_width))
    @b_right.css('height', this.px(height + this.border_padding * 2)).
             css('top', this.px(top - this.border_padding)).
             css('left', this.px(left + width + this.border_padding))
  
    @b_right.get(0).target_elem = @b_left.get(0).target_elem = @b_top.get(0).target_elem = @b_bottom.get(0).target_elem = orig_elem
  
    if makeRed || elem.hasClass("selectorgadget_suggested") || elem.hasClass("selectorgadget_selected")
      @b_top.addClass('selectorgadget_border_red')
      @b_bottom.addClass('selectorgadget_border_red')
      @b_left.addClass('selectorgadget_border_red')
      @b_right.addClass('selectorgadget_border_red')
    else
      if @b_top.hasClass('selectorgadget_border_red')
        @b_top.removeClass('selectorgadget_border_red')
        @b_bottom.removeClass('selectorgadget_border_red')
        @b_left.removeClass('selectorgadget_border_red')
        @b_right.removeClass('selectorgadget_border_red')

    @showBorders()
  
  px: (p) -> p + 'px'
  
  showBorders: ->
    @b_top.show()
    @b_bottom.show()
    @b_left.show()
    @b_right.show()
  
  removeBorders: ->
    if @b_top
      @b_top.hide()
      @b_bottom.hide()
      @b_left.hide()
      @b_right.hide()

  setupBorders: ->
    unless @.b_top
      width = @border_width + 'px'
      @b_top = jQuerySG('<div>').addClass('selectorgadget_border').css('height', width).hide().bind("mousedown.sg", { 'self': @ }, @sgMousedown)
      @b_bottom = jQuerySG('<div>').addClass('selectorgadget_border').addClass('selectorgadget_bottom_border').css('height', @px(@border_width + 6)).hide().bind("mousedown.sg", { 'self': @ }, @sgMousedown)
      @b_left = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", { 'self': @ }, @sgMousedown)
      @b_right = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", { 'self': @ }, @sgMousedown)
      @addBorderToDom()

  addBorderToDom: ->
    document.body.appendChild @b_top.get(0)
    document.body.appendChild @b_bottom.get(0)
    document.body.appendChild @b_left.get(0)
    document.body.appendChild @b_right.get(0)
  
  removeBorderFromDom: ->
    if @b_top
      @b_top.remove()
      @b_bottom.remove()
      @b_left.remove()
      @b_right.remove()
      @b_top = @b_bottom = @b_left = @b_right = null

  selectable: (elem) ->
    !@css_restriction || (@css_restriction && jQuerySG(elem).is(@css_restriction))
  
  sgMouseover: (e) ->
    gadget = e.data.self
    return true if gadget.unbound
    return false if @ == document.body || @ == document.body.parentNode
    self = jQuerySG(@)

    gadget.unhighlightIframes()
    gadget.highlightIframe(self, e) if self.is("iframe")
  
    if gadget.special_mode != 'd' # Jump to any the first selected parent of this node.
      parent = gadget.firstSelectedOrSuggestedParent(@)
      if parent != null && parent != @ && gadget.selectable(parent)
        gadget.makeBorders(parent, true)
      else
        gadget.makeBorders(@) if gadget.selectable(self)
    else
      if !jQuerySG('.selectorgadget_selected', @).get(0)
        gadget.makeBorders(@) if gadget.selectable(self)
    false
  
  firstSelectedOrSuggestedParent: (elem) ->
    orig = elem
    return elem if jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')
    while elem.parentNode && (elem = elem.parentNode)
      if jQuerySG.inArray(elem, @restricted_elements) == -1
        return elem if jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')
    null
  
  sgMouseout: (e) ->
    gadget = e.data.self
    return true if gadget.unbound
    return false if @ == document.body || @ == document.body.parentNode
    elem = jQuerySG(@)
    gadget.removeBorders()
    false

  highlightIframe: (elem, click) ->
    p = elem.offset()
    self = @
    target = jQuerySG(click.target)
    block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '99998').css('width', @px(elem.outerWidth())).
                              css('height', @px(elem.outerHeight())).css('top', @px(p.top)).css('left', this.px(p.left)).
                              css('background-color', '#AAA').css('opacity', '0.6').addClass("selectorgadget_iframe").addClass('selectorgadget_clean')

    instructions = jQuerySG("<div><span>This is an iframe.  To select in it, </span></div>").
                   addClass("selectorgadget_iframe_info").
                   addClass("selectorgadget_iframe").
                   addClass('selectorgadget_clean')
    instructions.css width: "200px", border: "1px solid #888",
                     padding: "5px", "background-color": "white",
                     position: "absolute", "z-index": "99999",
                     top: this.px(p.top + (elem.outerHeight() / 4.0)),
                     left: this.px(p.left + (elem.outerWidth() - 200) / 2.0),
                     height: "150px"

    src = null
    try
      src = elem.contents().get(0).location.href
    catch e
      src = elem.attr("src")
    instructions.append(jQuerySG("<a target='_top'>click here to open it</a>").attr("href", src))
    instructions.append(jQuerySG("<span>, then relaunch SelectorGadget.</span>"))
    document.body.appendChild(instructions.get(0))
    block.click -> target.mousedown() if self.selectable(target)
    document.body.appendChild(block.get(0))

  unhighlightIframes: (elem, click) ->
    jQuerySG(".selectorgadget_iframe").remove()
  
  sgMousedown: (e) ->
    gadget = e.data.self
    return true if gadget.unbound
    elem = this
    w_elem = jQuerySG(elem)
  
    if w_elem.hasClass('selectorgadget_border')
      # They have clicked on one of our floating borders, target the element that we are bordering.
      elem = elem.target_elem || elem
      w_elem = jQuerySG(elem)

    return if elem == document.body || elem == document.body.parentNode
  
    if gadget.special_mode != 'd'
      potential_elem = gadget.firstSelectedOrSuggestedParent(elem)
      if potential_elem != null && potential_elem != elem
        elem = potential_elem
        w_elem = jQuerySG(elem)
    else
      gadget.blockClicksOn(elem) if jQuerySG('.selectorgadget_selected', @).get(0) # Don't allow selection of elements that have a selected child.

    if !gadget.selectable(w_elem)
      gadget.removeBorders()
      gadget.blockClicksOn(elem)
      return false

    if w_elem.hasClass('selectorgadget_selected')
      w_elem.removeClass('selectorgadget_selected')
      gadget.selected.splice(jQuerySG.inArray(elem, gadget.selected), 1)
    else if w_elem.hasClass("selectorgadget_rejected")
      w_elem.removeClass('selectorgadget_rejected')
      gadget.rejected.splice(jQuerySG.inArray(elem, gadget.rejected), 1)
    else if w_elem.hasClass("selectorgadget_suggested")
      w_elem.addClass('selectorgadget_rejected')
      gadget.rejected.push(elem)
    else
      w_elem.addClass('selectorgadget_selected')
      gadget.selected.push(elem)

    gadget.clearSuggested()
    prediction = gadget.prediction_helper.predictCss(jQuerySG(gadget.selected), jQuerySG(gadget.rejected.concat(gadget.restricted_elements)))
    gadget.suggestPredicted(prediction)
    gadget.setPath(prediction)
  
    gadget.removeBorders()
    gadget.blockClicksOn(elem)
    w_elem.trigger("mouseover.sg", { 'self': gadget }) #  Refresh the borders by triggering a new mouseover event.

    false
  
  setupEventHandlers: ->
    jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseover.sg", { 'self': @ }, @sgMouseover)
    jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseout.sg", { 'self': @ }, @sgMouseout)
    jQuerySG("*:not(.selectorgadget_ignore)").bind("mousedown.sg", { 'self': @ }, @sgMousedown)
    jQuerySG("html").bind("keydown.sg", { 'self': @ }, @listenForActionKeys)
    jQuerySG("html").bind("keyup.sg", { 'self': @ }, @clearActionKeys)
  
  # The only action key right now is shift, which snaps to any div that has been selected.
  listenForActionKeys: (e) ->
    gadget = e.data.self;
    return true if gadget.unbound
    if e.keyCode == 16 || e.keyCode == 68 # shift or d
      gadget.special_mode = 'd'
      gadget.removeBorders()

  clearActionKeys: (e) ->
    gadget = e.data.self
    return true if gadget.unbound
    gadget.removeBorders()
    gadget.special_mode = null
  
  # Block clicks for a moment by covering this element with a div.  Eww?
  blockClicksOn: (elem) ->
    elem = jQuerySG(elem)
    p = elem.offset()
    block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '9999999').css('width', @px(elem.outerWidth())).
                              css('height', @px(elem.outerHeight())).css('top', @px(p.top)).css('left', @px(p.left)).
                              css('background-color', '')
    document.body.appendChild(block.get(0))
    setTimeout((-> block.remove()), 400)
    false
  
  setMode: (mode) ->
    if mode == 'browse'
      @removeEventHandlers()
    else if mode == 'interactive'
      @setupEventHandlers()
    @clearSelected()
  
  suggestPredicted: (prediction) ->
    if prediction && prediction != ''
      count = 0
      jQuerySG(prediction).each ->
        count += 1
        jQuerySG(@).addClass('selectorgadget_suggested') if !jQuerySG(@).hasClass('selectorgadget_selected') && !jQuerySG(@).hasClass('selectorgadget_ignore') && !jQuerySG(@).hasClass('selectorgadget_rejected')

      if @clear_button
        if count > 0
          @clear_button.attr('value', 'Clear (' + count + ')')
        else
          @clear_button.attr('value', 'Clear')

  setPath: (prediction) ->
    if prediction && prediction.length > 0
      @path_output_field.value = prediction
    else
      @path_output_field.value = 'No valid path found.'
  
  refreshFromPath: (e) ->
    self = (e && e.data && e.data.self) || @
    path = self.path_output_field.value;
    self.clearSelected()
    self.suggestPredicted(path)
    self.setPath(path)
  
  showXPath: (e) ->
    self = (e && e.data && e.data.self) || @
    path = self.path_output_field.value
    return if path == 'No valid path found.'
    prompt "The CSS selector '#{path}' as an XPath is shown below.  Please report any bugs that you find with this converter.",
           self.prediction_helper.cssToXPath(path)
  
  clearSelected: (e) ->
    self = (e && e.data && e.data.self) || @
    self.selected = []
    self.rejected = []
    jQuerySG('.selectorgadget_selected').removeClass('selectorgadget_selected')
    jQuerySG('.selectorgadget_rejected').removeClass('selectorgadget_rejected')
    self.removeBorders()
    self.clearSuggested()
  
  clearEverything: (e) ->
    self = (e && e.data && e.data.self) || @
    self.clearSelected()
    self.resetOutputs()
  
  resetOutputs: -> @setPath()
  
  clearSuggested: ->
    jQuerySG('.selectorgadget_suggested').removeClass('selectorgadget_suggested')
    @clear_button.attr('value', 'Clear') if @clear_button
  
  showHelp: ->
    alert "Click on a page element that you would like your selector to match (it will turn green). SelectorGadget will then generate a minimal CSS selector for that element, and will highlight (yellow) everything that is matched by the selector. Now click on a highlighted element to reject it (red), or click on an unhighlighted element to add it (green). Through this process of selection and rejection, SelectorGadget helps you to come up with the perfect CSS selector for your needs.\n\nHolding 'shift' while moving the mouse will let you select elements inside of other selected elements."
  
  useRemoteInterface: ->
    window.sg_options && window.sg_options.remote_interface
  
  updateRemoteInterface: (data_obj) ->
    @addScript(@composeRemoteUrl(window.sg_options.remote_interface, data_obj))
  
  composeRemoteUrl: (url, data_obj) ->
    params = (url.split("?")[1] && url.split("?")[1].split("&")) || []
    params.push("t=" + (new Date()).getTime())
    params.push("url=" + encodeURIComponent(window.location.href))
    if data_obj
      for key of data_obj
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data_obj[key]))
    if @remote_data
      for key of @remote_data
        params.push(encodeURIComponent("data[#{key}]") + '=' + encodeURIComponent(@remote_data[key]))
    url.split("?")[0] + "?" + params.join("&")
  
  addScript: (src) ->
    s = document.createElement('script')
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', src)
    head = document.getElementsByTagName('head')[0]
    if head
      head.appendChild(s)
    else
      document.body.appendChild(s)

  makeInterface: ->
    @sg_div = jQuerySG('<div>').attr('id', 'selectorgadget_main').addClass('selectorgadget_bottom').addClass('selectorgadget_ignore')
  
    if @useRemoteInterface()
      @path_output_field = { value: null }
      @remote_data = {}
      @updateRemoteInterface()
    else
      @makeStandardInterface()

    jQuerySG('body').append(@sg_div)
  
  makeStandardInterface: ->
    self = @;
    path = jQuerySG('<input>').attr('id', 'selectorgadget_path_field').addClass('selectorgadget_ignore').addClass('selectorgadget_input_field').keydown((e) ->
      if e.keyCode == 13
        self.refreshFromPath(e)
    ).focus(-> jQuerySG(this).select())
    @sg_div.append(path);
    @clear_button = jQuerySG('<input type="button" value="Clear"/>').bind("click", {'self': @}, @clearEverything).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field')
    @sg_div.append(this.clear_button)
    @sg_div.append(jQuerySG('<input type="button" value="Toggle Position"/>').click( ->
      if self.sg_div.hasClass('selectorgadget_top')
        self.sg_div.removeClass('selectorgadget_top').addClass('selectorgadget_bottom')
      else
        self.sg_div.removeClass('selectorgadget_bottom').addClass('selectorgadget_top')
    ).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'))
  
    @sg_div.append(jQuerySG('<input type="button" value="XPath"/>').bind("click", {'self': @}, @showXPath).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'))
  
    @sg_div.append(jQuerySG('<input type="button" value="?"/>').bind("click", {'self': @}, @showHelp).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'))
  
    @sg_div.append(jQuerySG('<input type="button" value="X"/>').bind("click", {'self': @}, @unbindAndRemoveInterface).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'))

    @path_output_field = path.get(0)
  
  removeInterface: (e) ->
    @sg_div.remove()
    @sg_div = null
  
  unbind: (e) ->
    self = (e && e.data && e.data.self) || @
    self.unbound = true
    self.removeBorderFromDom()
    self.clearSelected()
  
  unbindAndRemoveInterface: (e) ->
    self = (e && e.data && e.data.self) || @
    self.unbind()
    self.removeInterface()
  
  setOutputMode: (e, output_mode) ->
    self = (e && e.data && e.data.self) || @
    self.output_mode = (e && e.data && e.data.mode) || output_mode
  
  rebind: ->
    @unbound = false
    @clearEverything()
    @setupBorders()
  
  rebindAndMakeInterface: ->
    @makeInterface()
    @rebind()
  
  randBetween: (a, b) ->
    Math.floor(Math.random() * b) + a
  
  @toggle: (options) ->
    if !window.selector_gadget
      window.selector_gadget = new SelectorGadget()
      window.selector_gadget.makeInterface()
      window.selector_gadget.clearEverything()
      window.selector_gadget.setMode('interactive')
      window.selector_gadget.analytics() unless options?.analytics == false
    else if window.selector_gadget.unbound
      window.selector_gadget.rebindAndMakeInterface()
    else
      window.selector_gadget.unbindAndRemoveInterface()

    jQuerySG('.selector_gadget_loading').remove()
  
  analytics: ->
    # http://www.vdgraaf.info/google-analytics-without-javascript.html
    utmac = 'UA-148948-9'
    utmhn = encodeURIComponent('www.selectorgadget.com')
    utmn = this.randBetween(1000000000,9999999999) # random request number
    cookie = this.randBetween(10000000,99999999) # random cookie number
    random = this.randBetween(1000000000,2147483647) # number under 2147483647
    today = Math.round(new Date().getTime()/1000.0)
    referer = encodeURIComponent(window.location.href) # referer url
    uservar='-' # enter your own user defined variable
    utmp='sg';
  
    urchinUrl = 'http://www.google-analytics.com/__utm.gif?utmwv=1&utmn=' + utmn + '&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn=' + utmhn + '&utmr=' + referer + '&utmp=' + utmp + '&utmac=' + utmac + '&utmcc=__utma%3D' + cookie + '.' + random + '.' + today + '.' + today + '.' + today + '.2%3B%2B__utmb%3D' + cookie + '%3B%2B__utmc%3D' + cookie + '%3B%2B__utmz%3D' + cookie + '.' + today + '.2.2.utmccn%3D(direct)%7Cutmcsr%3D(direct)%7Cutmcmd%3D(none)%3B%2B__utmv%3D' + cookie + '.' + uservar + '%3B';
    document.body.appendChild(jQuerySG('<img />').attr('src', urchinUrl).get(0))
