# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'sprockets', :destination => 'build', :asset_paths => ['lib', 'vendor'] do
  watch (%r{^lib/js/.*}) { |m| "lib/js/selectorgadget.js" }
  watch (%r{^lib/css/.*}) { |m| "lib/css/selectorgadget.css.scss" }
end

guard 'sprockets', :destination => 'spec/compiled', :asset_paths => ['spec'] do
  watch (%r{^spec/*.js})
end
