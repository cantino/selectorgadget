beforeEach(function () {
  jQuerySG.fx.off = true;
  jQuerySG('#jasmine-content').empty();
  jasmine.Clock.useMock();

  jQuerySG.ajaxSettings.xhr = function () {
    expect("you to mock all ajax, but your tests actually seem").toContain("an ajax call");
  };
});

afterEach(function () {
  jasmine.Clock.reset();

  // Clear any jQuery live event bindings
  var events = jQuerySG.data(document, "events");
  for (var prop in events) {
    delete events[prop];
  }
});
