// We use Sprockets to bundle our JavaScript libraries together.
//= require jquery.js
//= require_self
//= require diff/diff_match_patch.js
//= require core/jqueryContentMatcher.js
//= require core/dom.js.coffee
//= require core/core.js.coffee
//= require wizard/wizard.js

window.jQuerySG = jQuery.noConflict(true);
