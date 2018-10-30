'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files']
});

var _ = require('lodash');

gulp.task('styles-reload', ['styles'], function() {
  return buildStyles()
    .pipe(browserSync.stream());
});

gulp.task('styles', function() {
  return buildStyles();
});

var buildStyles = function() {
  var lessOptions = {
    paths: [
      'node_modules',
      path.join(conf.paths.src, '/app')
    ],
    relativeUrls : true
  };

  var injectNpm = gulp.src($.mainBowerFiles({
    paths: {
      bowerDirectory: 'node_modules',
      bowerJson: 'package.json',
    },
    filter: /\.less$/
  }), {read: false});

  var injectNpmOptions = {
    transform: function (filePath) {
      filePath = '../../' + filePath;
      return '@import "' + filePath + '";';
    },
    starttag: '// npminjector',
    endtag: '// endnpminjector',
    addRootSlash: false
  };

  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/app/**/*.less'),
    path.join('!' + conf.paths.src, '/app/index.less')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };


  return gulp.src([
    path.join(conf.paths.src, '/app/index.less')
  ])
    .pipe($.inject(injectNpm, injectNpmOptions))
    .pipe($.inject(injectFiles, injectOptions))
    .pipe($.sourcemaps.init())
    .pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};
