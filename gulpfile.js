var gulp = require('gulp')
var uglify = require('gulp-uglify')
var buffer = require('vinyl-buffer')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
gulp.task('browserify', function() {  
  return browserify('./app/public/js/app.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./app/public/js'));
});

gulp.task('watch', function() {
  gulp.watch('./app/public/js*.js', ['browserify'])
  return;
});

gulp.task('build', function() {
  gulp.start(['browserify']);
  return;
});

gulp.task('server', function() {
  nodemon({
    script: 'index.js',
    ext: 'js',
    ignore: '.git'
  });
});

// -- Run ----------------------------------------------------------------------

gulp.task('default', function() {
  gulp.start(['build', 'watch', 'server']);
  return;
});