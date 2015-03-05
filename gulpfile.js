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
  , ignore      = require('gulp-ignore')
  , git         = require('gulp-git')
  , bump        = require('gulp-bump')
  , filter      = require('gulp-filter')
  , tag         = require('gulp-tag-version')
  , pkg         = require('./package.json')
  , signature   = fs.readFileSync('./signature')
  , gitignore   = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore') + '' : '';

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

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
function bumper(importance) {
  // get all the files to bump version in 
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files 
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'));
}

gulp.task('release', function () {
  var version = require('./package.json').version;

  return gulp.src('./*')
    .pipe(ignore.include(gitignore))
    // Add all files.
    .pipe(git.add({ args: '-u' }))
    // Commit the changed version number.
    .pipe(git.commit('Created release v' + version))
    // Read only one file to get the version number.
    // .pipe(filter('package.json'))
    // Tag it to the repository. 
    // .pipe(tag())
});

// Versioning tags.
gulp.task('version:patch', bumper.bind(this, 'patch'));
gulp.task('version:minor', bumper.bind(this, 'minor'));
gulp.task('version:major', bumper.bind(this, 'major'));

// Common alias.
gulp.task('version', ['version:minor']);

// Releasing tasks.
gulp.task('push:patch',   ['version:patch'], ['build'], ['release']);
gulp.task('push:feature', ['version:minor'], ['build'], ['release']);
gulp.task('push:release', ['version:major'], ['build'], ['release']);

// Common alias.
gulp.task('push', ['push:feature']);

// Compilation tasks.
gulp.task('build', ['css', 'script']);
gulp.task('default', ['build']);
