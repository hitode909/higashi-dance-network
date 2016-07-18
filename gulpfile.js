const gulp   = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');

gulp.task('build', function() {
    browserify(
        {
            entries: ['public/kasanegi/src/main.coffee'],
            extensions: ['.coffee'],
            transform: ['coffeeify']
        }
    ).bundle(
    ).pipe(
        source('bundle.js')
    ).pipe(gulp.dest('public/kasanegi/js/'));
});

gulp.task('watch', function() {
    gulp.watch('public/kasanegi/js/*.coffee', ['build']);
});

gulp.task('default', ['build']);
