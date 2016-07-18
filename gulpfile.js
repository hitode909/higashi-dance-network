const gulp   = require('gulp');
const coffee = require('gulp-coffee');

gulp.task('build', () =>
          gulp.src('public/kasanegi/js/*.coffee')
          .pipe(coffee({bare: true}))
          .pipe(gulp.dest('public/kasanegi/js'))
         );

gulp.task('watch', function() {
    gulp.watch('public/kasanegi/js/*.coffee', ['build']);
});

gulp.task('default', ['build']);
