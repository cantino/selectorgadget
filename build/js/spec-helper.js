(function() {
  beforeEach(function() {
    jQuerySG.fx.off = true;
    jQuerySG('#jasmine-content').empty();
    jasmine.Clock.useMock();
    return jQuerySG.ajaxSettings.xhr = function() {
      return expect("you to mock all ajax, but your tests actually seem").toContain("an ajax call");
    };
  });

  afterEach(function() {
    var events, prop, results;
    jasmine.Clock.reset();
    events = jQuerySG.data(document, "events");
    results = [];
    for (prop in events) {
      results.push(delete events[prop]);
    }
    return results;
  });

}).call(this);
