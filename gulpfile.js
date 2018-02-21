var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');

const path = {
  test: './coffee/test/*.coffee',
  routes: './coffee/routes/*.coffee',
  tools: './coffee/tools/*.coffee'
}

gulp.task('test', function(done) {
  gulp.src(path.test)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./test/'));
  done();
});

gulp.task('routes', function(done) {
  gulp.src(path.routes)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./routes/'));
  done();
});

gulp.task('tools', function(done) {
  gulp.src(path.tools)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./tools/'));
  done();
});

gulp.task('watch', function(done) {
  gulp.watch(path.test, gulp.series('test'));
  gulp.watch(path.routes, gulp.series('routes'));
  gulp.watch(path.tools, gulp.series('tools'));
});

gulp.task('default', gulp.parallel('test', 'routes', 'tools', 'watch'), function(done) {
  done();
})