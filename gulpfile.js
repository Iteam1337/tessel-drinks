var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  plumber = require('gulp-plumber'),
  Q = require('q');

/**
 * Run lint and tests
 */
gulp.task('test', function (callback) {
  Q.longStackSupport = true;
  return gulp.src(['index.js', 'lib/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('end', function () {
      gulp.src(['test/unit/**/*.js'])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(mocha({reporter: 'spec'}));
    });
});

/**
 * Watch for file changes
 */
gulp.task('watch', function () {
  gulp.watch(['*.js', 'lib/**/*.js', 'test/**/*.js'], ['test']);
});

/**
 * CLI tasks
 */
gulp.task('default', ['test', 'watch']);