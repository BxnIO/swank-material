'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    wiredep = require('wiredep').stream,
    inject = require('gulp-inject'),
    angularFilesort = require('gulp-angular-filesort'),
    open = require('gulp-open');

var sources = ['src/**/*.js'];
var toWatch = ['src/**/*.js', './test.html', 'bower_components/swank/dist/**/*.js']

gulp.task('clean', function() { del(['dist/*']); });

gulp.task('build', ['clean'], function() {
  gulp.src(sources)
    .pipe(concat('swank-material.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename('swank-material.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

gulp.task('inject-vendor', function() {
  gulp.src('test.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});

gulp.task('reload', function() {
  gulp.src(toWatch)
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(toWatch, ['reload']);
});

gulp.task('open', function() {
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:8080/test.html'}));
});

gulp.task('dev', ['connect', 'build', 'inject-vendor', 'open', 'watch'], function() {});

gulp.task('default', ['connect', 'open', 'watch']);
