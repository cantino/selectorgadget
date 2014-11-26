/**
 * Main SelectorGadgets file.
 */

require('coffee-script');
module.exports = require('./core/core');

// For non-node environments.
if (typeof window != 'undefined') {
  window.SelectorGadget = module.exports;
}
