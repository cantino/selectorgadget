/**
 * Building scripts.
 */

var fs          = require('fs')
  , gulp        = require('gulp')
  , browserify  = require('browserify')
  , transform   = require('vinyl-transform')
  , source      = require('vinyl-source-stream')
  , concat      = require('gulp-concat')
  , uglify      = require('gulp-uglify')
  , minify      = require('gulp-minify-css')
  , streamify   = require('gulp-streamify')
  , header      = require('gulp-header')
  , pkg         = require('./package.json')
  , signature   = fs.readFileSync('./signature');

/**
 * Get signature header.
 */
function signatureHeader() {
  return header(signature, {
    pkg: pkg
  });
}

/**
 * Build a distribute bundler for SelectorGadget.
 */
gulp.task('script', function() {
  var browserified = transform(function(filename) {
    return browserify(filename).bundle();
  });

  return gulp.src(['./lib/js/main.js'])
    .pipe(browserified)
    .pipe(concat(pkg.name + '.js'))
    .pipe(signatureHeader())
    .pipe(gulp.dest('./dist'))
    .pipe(uglify({ mangle: false }))
    .pipe(signatureHeader())
    .pipe(concat(pkg.name + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

/**
 * Build a distribute CSS.
 */
gulp.task('css', function () {
  gulp.src('./lib/css/*.css')
    .pipe(concat(pkg.name + '.css'))
    .pipe(signatureHeader())
    .pipe(gulp.dest('./dist'))
    .pipe(minify())
    .pipe(signatureHeader())
    .pipe(concat(pkg.name + '.min.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['css', 'script']);
gulp.task('default', ['build']);
