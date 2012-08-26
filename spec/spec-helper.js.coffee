beforeEach ->
  jQuerySG.fx.off = true
  jQuerySG('#jasmine-content').empty()
  jasmine.Clock.useMock()

  jQuerySG.ajaxSettings.xhr = ->
    expect("you to mock all ajax, but your tests actually seem").toContain "an ajax call"

afterEach ->
  jasmine.Clock.reset()

  # Clear any jQuery live event bindings
  events = jQuerySG.data(document, "events")
  delete events[prop] for prop of events
