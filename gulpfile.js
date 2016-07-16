const gulp   = require('gulp');
const coffee = require('gulp-coffee');

gulp.task('kasanegi-coffee', () =>
          gulp.src('public/kasanegi/js/*.coffee')
          .pipe(coffee({bare: true}))
          .pipe(gulp.dest('public/kasanegi/js'))
         );

gulp.task('watch', function() {
    gulp.watch('public/kasanegi/js/*.coffee', ['kasanegi-coffee']);
});

gulp.task('default', ['kasanegi-coffee']);
