describe "DomPredictionHelper", ->
  fixtures =
    class_name_tests: '<div id="class_name_tests">' +
                      '  <div class="iCIMS_InfoMsg iCIMS_InfoMsg_Job">' +
                      '    <span id="moo">Hello      </span>' +
                      '  </div>' +
                      '</div>'
    leaves: "<div id='parent1'>" +
            "<span class='sibling' id='some_id'>" +
            "  <b>&nbsp;</b>" +
            "</span>" +
            "<span class='sibling something else'>" +
            "  <i id='leaf1'>&nbsp;</i>" +
            "</span>" +
            "<span class='sibling' id='leaf2'>" +
            "  <b>&nbsp;</b>" +
            "</span>" +
            "<span class='sibling'>&nbsp;</span>" +
            "</div>"
    big_structure:  "<div>" +
                    "  <strong>" +
                    "    <table class='reasonable'>" +
                    "      <tr>" +
                    "        <td id='omg-im-ugly-7777777'>" +
                    "          <div>hi</div>" +
                    "          <div id='a' class='hi'>" +
                    "            <b class='b'>" +
                    "              <div>" +
                    "              </div>" +
                    "            </b>" +
                    "          </div>" +
                    "        </td>" +
                    "      </tr>" +
                    "    </table>" +
                    "  </strong>" +
                    "</div>" +
                    "" +
                    "<table>" +
                    "  <tr id='something_else'>" +
                    "    <td>" +
                    "      <div id='a' class='hi'>" +
                    "        <spacer />" +
                    "      </div>" +
                    "    </td>" +
                    "  </tr>" +
                    "</table>" +
                    "" +
                    "<div>" +
                    "  <b>" +
                    "    <strong>" +
                    "      <div>" +
                    "        Yo" +
                    "      </div>" +
                    "    </strong>" +
                    "  </b>" +
                    "</div>" +
                    "" +
                    "<ul id='jobs'>" +
                    "  <li>" +
                    "    <ul>" +
                    "      <li>do not want</li>" +
                    "      <li>do not want</li>" +
                    "      <li>do not want</li>" +
                    "      <li>do not want</li>" +
                    "      <li>do not want</li>" +
                    "    </ul>" +
                    "  </li>" +
                    "  <li>hi thar</li>" +
                    "  <li>WANT</li>" +
                    "  <li>omonomonom</li>" +
                    "</ul>" +
                    "" +
                    "<div id='sibling_test'>" +
                    "  <div>" +
                    "    <h3 class='a'>Awesome</h3>" +
                    "    <span>Goal</span>" +
                    "  </div>" +
                    "  <div>" +
                    "    <h3 class='a'>Awesome</h3>" +
                    "    <span>Goal</span>" +
                    "  </div>" +
                    "  <div>" +
                    "    <h4>Awesome</h4>" +
                    "    <span>Not Goal</span>" +
                    "  </div>" +
                    "</div>" +
                    "" +
                    "<font color='003366'><strong><u>Department:</u><span class='wrap'>IT&amp;C MANAGEMENT SERVICES</span></strong></font><br><br>" +
                    "<font color='003366'><strong><u>Requisition ID:</u><span class='wrap'>20913</span></strong></font><br><br>" +
                    "<font color='003366'><strong><u>Job Title:</u><span class='wrap'>Manager, Strategic Systems</span></strong></font><br>" +
                    "<font color='003366'><strong><u>Location:</u><span class='wrap'>El Segundo, CA  (Los Angeles)</span></strong></font><br><br>"

  dom = null

  beforeEach ->
    dom = new DomPredictionHelper()

  describe "escapeCssNames", ->
    it "escapes illegal characters in css", ->
      expect(dom.escapeCssNames("this.is.a.test")).toEqual("this\\.is\\.a\\.test")
      expect(dom.escapeCssNames("this#is#a#test")).toEqual("this\\#is\\#a\\#test")
      expect(dom.escapeCssNames("this>is>a>test")).toEqual("this\\>is\\>a\\>test")
      expect(dom.escapeCssNames("this,is,a,test")).toEqual("this\\,is\\,a\\,test")
      expect(dom.escapeCssNames("this,is,a|test")).toEqual("this\\,is\\,a\\|test")
      expect(dom.escapeCssNames("selectorgadget_blahblah")).toEqual("")
      expect(dom.escapeCssNames("selectorgadget_suggested")).toEqual("")
      expect(dom.escapeCssNames("suggested ")).toEqual("suggested") # Paranoid - remove spaces.
      expect(dom.escapeCssNames("hello\\")).toEqual("hello\\\\")
      expect(dom.escapeCssNames("iCIMS_InfoMsg_Job")).toEqual("iCIMS_InfoMsg_Job")

  describe "tokenizeCss", ->
    it "breaks css selectors into tokens", ->
      expect(dom.tokenizeCss("div#id")).toEqual(["div", "#id"])
      expect(dom.tokenizeCss("div#id").toString()).not.toEqual(["div#", "id"])
      expect(dom.tokenizeCss("div#id").toString()).not.toEqual(["div", "id"])
      expect(dom.tokenizeCss("div,html").toString()).not.toEqual(["div", " ", ",", " ", "id"])
      expect(dom.tokenizeCss("div #id")).toEqual(["div", " ", "#id"])
      expect(dom.tokenizeCss("div      \t#id")).toEqual(["div", " ", "#id"])
      expect(dom.tokenizeCss("div div#id.class1.class2:nth-child(2) span")).toEqual(["div", " ", "div", "#id", ".class1", ".class2", ":nth-child(2)", " ", "span"])
      expect(dom.tokenizeCss("div > id")).toEqual(["div", " ", ">", " ", "id"])
      expect(dom.tokenizeCss("div>id")).toEqual(["div", " ", ">", " ", "id"])
      expect(dom.tokenizeCss("div.class div a#blah\\.hi")).toEqual(["div", ".class", " ", "div", " ", "a", "#blah\\.hi"])
      expect(dom.tokenizeCss("strong~ h1:nth-child(2)+ b")).toEqual(["strong", "~", " ", "h1", ":nth-child(2)", "+", " ", "b"])

  describe "tokenizeCssForDiff", ->
    it "should tokenize css for diffing", ->
      expect(dom.tokenizeCssForDiff("div > id")).toEqual(["div", " ", ">", " ", "id"])
      expect(dom.tokenizeCssForDiff("div.class>id")).toEqual(["div", ".class", " ", ">", " ", "id"])
      expect(dom.tokenizeCssForDiff("strong#hi~ h1:nth-child(2)+ b")).toEqual(["strong#hi~", " ", "h1:nth-child(2)+", " ", "b"])

  describe "encodeCssForDiff", ->
    it "should encode the css in preparation for diffing", ->
      existing_tokens = {}
      strings = ["body div#main #something", "body div#main #something_else"]
      new_strings = dom.encodeCssForDiff(strings, existing_tokens)
      expect(new_strings[1].substring(0, 1)).toEqual(new_strings[0].substring(0, 1))
      expect(dom.invertObject(existing_tokens)[new_strings[0].substring(0, 1)]).toEqual('body')
      expect(new_strings[0].substring(1, 2)).toEqual(new_strings[1].substring(1, 2))
      expect(dom.invertObject(existing_tokens)[new_strings[0].substring(1, 2)]).toEqual(' ')
      expect(new_strings[0].substring(2, 3)).toEqual(new_strings[1].substring(2, 3))
      expect(new_strings[0].substring(3, 4)).toEqual(new_strings[1].substring(3, 4))
      expect(dom.invertObject(existing_tokens)[new_strings[0].substring(3, 4)]).toEqual('#main')
      expect(new_strings[0].substring(5, 6)).not.toEqual(new_strings[1].substring(5, 6))

    it "should encode and decode to the same values", ->
      existing_tokens = {}
      strings = ["body div#main #something", "body div#main #something_else"]
      new_strings = dom.encodeCssForDiff(strings, existing_tokens)
      expect(dom.decodeCss(new_strings[0], existing_tokens)).toEqual("body div#main #something")

  describe "cleanCss", ->
    it "should clean unneeded white space and child and sibling selectors", ->
      expect(dom.cleanCss("tr>td#hi")).toEqual("tr > td#hi")
      expect(dom.cleanCss("tr > td#hi")).toEqual("tr > td#hi")
      expect(dom.cleanCss(", , > tr >  >     > td#hi >")).toEqual("tr > td#hi")
      expect(dom.cleanCss("h1~ hello+ br")).toEqual("h1~ hello+ br")
      expect(dom.cleanCss(" ~ hello+ br")).toEqual("hello+ br")
      expect(dom.cleanCss(" + ~ ")).toEqual("")
      expect(dom.cleanCss("br+")).toEqual("br")

  describe "cssDiff", ->
    beforeEach ->
      jQuerySG("#jasmine-content").html fixtures.leaves

    it "can diff two css selectors", ->
      expect(dom.cssDiff([])).toEqual('')
      expect(dom.cssDiff([''])).toEqual('')
      expect(dom.cssDiff(["body div#main #something", "body div#main #something_else"])).toEqual('body div#main')
      expect(dom.cssDiff(["body blah div#main", "body div#main"])).toEqual('body div#main')
      expect(dom.cssDiff(["body blah a div#main", "body div#main"])).toEqual('body div#main')

      p1 = dom.pathOf(jQuerySG('#parent1 span.sibling:nth-child(1)').get(0))
      p2 = dom.pathOf(jQuerySG('#parent1 span.sibling:nth-child(2)').get(0))
      expect(dom.cssDiff([ p1, p2 ])).toEqual('body > div#jasmine-content:nth-child(2) > div#parent1:nth-child(1) > span.sibling')

      expect(dom.cssDiff(["ul li#foo", "li div#foo"])).toEqual('li#foo')
      expect(dom.cssDiff(["ul > li#foo", "ul > li > ol > li#foo"])).toEqual('ul > li#foo')

  describe "childElemNumber", ->
    it "returns the element number of the child", ->
      parent = jQuerySG('<div>').append(jQuerySG('<b>hello</b>')).append(jQuerySG('<b>hi</b>')).append(document.createTextNode('hi')).append(jQuerySG('<b>there</b>')).get(0)
      expect(dom.childElemNumber(parent.childNodes[0])).toEqual(0)
      expect(dom.childElemNumber(parent.childNodes[1])).toEqual(1)
      expect(dom.childElemNumber(parent.childNodes[2])).toEqual(2)

      expect(dom.childElemNumber(jQuerySG(':nth-child(1)', parent).get(0))).toEqual(0)
      expect(dom.childElemNumber(jQuerySG(':nth-child(2)', parent).get(0))).toEqual(1)
      expect(dom.childElemNumber(jQuerySG(':nth-child(3)', parent).get(0))).toEqual(2)

  describe "pathOf", ->
    beforeEach ->
      jQuerySG("#jasmine-content").append(fixtures.class_name_tests).append(fixtures.leaves)

    it "returns the full dom path of an element", ->
      expect(dom.pathOf(jQuerySG('#leaf1').get(0)).indexOf("#leaf1")).toBeGreaterThan(-1)
      expect(dom.pathOf(jQuerySG('#leaf1').get(0)).indexOf("span.sibling.something.else:nth-child(2) > i#leaf1")).toBeGreaterThan(-1)
      expect(dom.pathOf(jQuerySG('#class_name_tests #moo').get(0)).indexOf(".iCIMS_InfoMsg.iCIMS_InfoMsg_Job")).toBeGreaterThan(-1)
      expect(dom.pathOf(jQuerySG('#class_name_tests #moo').get(0)).indexOf("body:nth-child")).toEqual(-1)

    it "should add siblings with pluses and tildes", ->
      expect(dom.pathOf(jQuerySG('#parent1 .sibling.something.else').get(0)).indexOf("span#some_id.sibling:nth-child(1)+ span.sibling.something.else:nth-child(2)")).toBeGreaterThan(-1)

  describe "simplifyCss", ->
    beforeEach ->
      jQuerySG("#jasmine-content").append(fixtures.big_structure)

    it "should simplify css based on selected and rejected sets", ->
      expect(dom.simplifyCss("body", jQuerySG("body"), jQuerySG([]))).toEqual("body")
      expect(dom.simplifyCss("body", jQuerySG("a"), jQuerySG([]))).toEqual("")
      expect(dom.simplifyCss("body", jQuerySG([]), jQuerySG([]))).toEqual("")
      expect(dom.simplifyCss("tr td", jQuerySG("tr td div, tr td"), jQuerySG([]))).toEqual("")
      expect(dom.simplifyCss("tr td", jQuerySG("table tr td, tr td"), jQuerySG([]))).toEqual("td")
      expect(dom.simplifyCss("strong > div", jQuerySG("div b strong div"), jQuerySG("div strong div#a b div"))).toEqual("strong > div")
      expect(dom.simplifyCss("tr td", jQuerySG("table tr td, tr td"), jQuerySG("tr"))).toEqual("td")
      expect(dom.simplifyCss("#jobs > li:nth-child(3)",
                             jQuerySG('#jobs>li:nth-child(3)'),
                             jQuerySG('#jobs ul li:nth-child(3)'))).toEqual("#jobs > li")
      expect(dom.simplifyCss("div+ ul#jobs > li:nth-child(3)",
                             jQuerySG('#jobs>li:nth-child(3)'),
                             jQuerySG('#jobs ul li:nth-child(3)'))).toEqual("#jobs > li")

    it "should work with numerical ids", ->
      expect(dom.simplifyCss("table.reasonable>tr>td#omg-im-ugly-7777777",
                             jQuerySG('#omg-im-ugly-7777777'),
                             jQuerySG('#something_else td'))).toEqual(".reasonable td")

  describe "positionOfSpaceBeforeIndexOrLineStart", ->
    it "should return the position of the space before index or line start", ->
      expect(dom.positionOfSpaceBeforeIndexOrLineStart(3, ["a", "b", "c", "d"])).toEqual(0)
      expect(dom.positionOfSpaceBeforeIndexOrLineStart(3, ["a", " ", "c", "d"])).toEqual(1)
      expect(dom.positionOfSpaceBeforeIndexOrLineStart(3, ["a", " ", " ", "d", "e"])).toEqual(2)

  describe "predictCss", ->
    beforeEach ->
      jQuerySG("#jasmine-content").append(fixtures.leaves).append(fixtures.big_structure)

    it "predicts css", ->
      expect(dom.predictCss(jQuerySG('#parent1 span.sibling:nth-child(1), #parent1 span.sibling:nth-child(2)'),
                                              jQuerySG("dfdfdf"))).toEqual('.sibling')

      expect(jQuerySG('#jobs>li:nth-child(3)').length).toEqual(1)
      expect(jQuerySG('#jobs ul li:nth-child(3)').length).toEqual(1)
      expect(dom.predictCss(jQuerySG('#jobs>li:nth-child(3)'), jQuerySG('#jobs ul li:nth-child(3)'))).toEqual('#jobs > li')

      expect('#leaf1', dom.predictCss(jQuerySG('#parent1 i'), jQuerySG('#parent1 b'))).toEqual('#leaf1')

      expect(dom.predictCss(jQuerySG('#sibling_test h3 + span'), jQuerySG('#sibling_test h4 + span'))).toEqual('.a+ span')
      expect(dom.predictCss(jQuerySG('#sibling_test h3.a + span'), jQuerySG('#sibling_test h4 + span'))).toEqual('.a+ span')

  describe "selectorGets", ->
    beforeEach ->
      jQuerySG("#jasmine-content").append(fixtures.leaves).append(fixtures.big_structure)

    it "determines how the selector matches the set", ->
      expect(jQuerySG('table td div#a, #something_else td div.hi').length).toEqual(2)
      expect(dom.selectorGets('all', jQuerySG('table td div#a, #something_else td div#a'), 'div#a')).toEqual(true)
      expect(jQuerySG('table td div:nth-child(2), #something_else td div.hi').length).toEqual(2)
      expect(dom.selectorGets('all', jQuerySG('table td div#a.hi:nth-child(2), #something_else td div#a.hi'), 'div#a')).toEqual(true)
      expect(dom.selectorGets('all', jQuerySG("generates-empty-dflkjsdf"), '#b')).toEqual(false)
      expect(dom.selectorGets('none', jQuerySG("generates-empty-dflkjsdf"), '#b')).toEqual(true)
      expect(dom.selectorGets('none', jQuerySG('table td div#a, #something_else td div#a'), '#b')).toEqual(true)
      expect(dom.selectorGets('none', jQuerySG('table td div#a, #something_else td div#a'), 'table')).toEqual(true)
      expect(dom.selectorGets('none', jQuerySG('table, #something_else td div#a'), 'table')).toEqual(false)

  describe "wouldLeaveFreeFloatingNthChild", ->
    it "determines if a floating nthchild would be left by the removal of the specified element", ->
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)", " ", "div"], 0)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)", " ", "div"], 1)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)", " ", "div"], 2)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)", " ", "div"], 3)).toBeFalsy()

      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 0)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 1)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 2)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 3)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 4)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)", " ", "div"], 5)).toBeFalsy()

      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)"], 3)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ".hi", " ", "a", ":nth-child(0)"], 4)).toBeFalsy()

      expect(dom.wouldLeaveFreeFloatingNthChild(["div", ":nth-child(0)"], 0)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild([" ", "div", ":nth-child(0)"], 1)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild([".a", ":nth-child(0)"], 0)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild([" ", "#a", ":nth-child(0)"], 1)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["div", " ", "#a", ":nth-child(0)"], 2)).toBeTruthy()

      expect(dom.wouldLeaveFreeFloatingNthChild([":nth-child(2)", " ", ":nth-child(2)", " ", ":nth-child(2)", " ",
                                                     ":nth-child(1)", " ", ":nth-child(1)", " ", "#today", ":nth-child(1)",
                                                     " ", "#todaybd", ":nth-child(3)"], 10)).toBeTruthy()

      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)"], 0)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", "", "", ":nth-child(0)"], 0)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["", "", "a", "", "", ":nth-child(0)"], 2)).toBeTruthy()
      expect(dom.wouldLeaveFreeFloatingNthChild(["a", ":nth-child(0)"], 1)).toBeFalsy()

      expect(dom.wouldLeaveFreeFloatingNthChild(["a"], 0)).toBeFalsy()
      expect(dom.wouldLeaveFreeFloatingNthChild([":nth-child(0)"], 0)).toBeFalsy()

  describe "_removeElements", ->
    it "removes matching elements", ->
      expect(dom._removeElements(0, ["a", "b", "c"], "a", -> true)).toEqual(["", "b", "c"])
      expect(dom._removeElements(0, ["a", "b", "c"], "a", -> false)).toEqual(["a", "b", "c"])
      expect(dom._removeElements(4, ["a", " ", "c", "d", "+", " ", "e"], "+", -> true)).toEqual(["a", "", "", "", "", " ", "e"])
      expect(dom._removeElements(4, ["a", " ", "c", "d", "+", " ", "e"], "+", -> false)).toEqual(["a", " ", "c", "d", "+", " ", "e"])
      expect(dom._removeElements(4, ["a", "e", "c", "d", "+", " ", "e"], "+", -> true)).toEqual(["", "", "", "", "", " ", "e"])
      expect(dom._removeElements(4, ["a", "e", "c", "d", "+", " ", "e"], "+", -> false)).toEqual(["a", "e", "c", "d", "+", " ", "e"])

  describe "cssToXPath", ->
    beforeEach ->
      for fixture_name, fixture_contents of fixtures
        jQuerySG("#jasmine-content").append fixture_contents

    it "converts css to xpath", ->
      cssAndXPathMatch = (css, xpath) ->
        css_matches = jQuerySG(css)
        elems = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null)
        while elem = elems.iterateNext()
          unless elem in css_matches
            return false
        true

      expressions = ['a', '#leaf1', 'body #leaf1', 'span.sibling.something.else', 'a , b , #leaf1',
                     'span.sibling', '.else.something', ':nth-child(2) i#leaf1', 'span.something.else:nth-child(2) i#leaf1']

      for css in expressions
        expect(cssAndXPathMatch(css, dom.cssToXPath(css))).toBeTruthy()
