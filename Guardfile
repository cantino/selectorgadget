# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'sprockets', :destination => 'build', :asset_paths => ['lib', 'vendor'] do #, :minify => true do
  watch (%r{^lib/js/[^\.].*\.(js|coffee)$}) { |m| "lib/js/selectorgadget_combined.js" }
  watch (%r{^lib/css/[^\.].*\.(scss|css)$}) { |m| "lib/css/selectorgadget_combined.css" }
end

guard 'sprockets', :destination => 'spec/compiled', :asset_paths => ['spec'] do
  watch (%r{^spec/[^\.].*\.(coffee|js)})# { |m| "spec/specs.js" }
end
