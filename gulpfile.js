var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var sass = require('gulp-sass');

gulp.task('scripts', function() {
  return browserify('./lib/js/main')
    .bundle()
    .pipe(source('selectorgadget_combined.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build'));
});

gulp.task('sass', function () {
    gulp.src('./lib/css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./build'));
});

// Default Task
gulp.task('default', ['sass', 'scripts']);