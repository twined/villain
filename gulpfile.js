var gulp = require('gulp');

gulp.task('sass', function() {
    var sass = require('gulp-ruby-sass');
    gulp.src('src/sass/villain.scss')
        .pipe(sass({sourcemap: true, sourcemapPath: 'src/sass/**/*.scss'}))
        .on('error', function(err) { console.log(err.message); })
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-sass', function() {
    var sass = require('gulp-ruby-sass');
    var rename = require('gulp-rename');
    var minify = require('gulp-minify-css');
    gulp.src('src/sass/villain.scss')
        .pipe(sass({sourcemap: true, sourcemapPath: 'src/sass/**/*.scss'}))
        .on('error', function(err) { console.log(err.message); })
        .pipe(gulp.dest('dist/'))
        .pipe(rename({suffix: '-min'}))
        .pipe(minify())
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
    var watch = require('gulp-watch');
    watch('src/**/*.js', function(files, cb) {
        gulp.start('build-scripts', cb);
    });
    watch('src/sass/**/*.scss', function(files, cb) {
        gulp.start('sass', cb);
    });
});

gulp.task('scripts', function() {
    var rigger = require('gulp-rigger');
    gulp.src('src/villain.js')
        .pipe(rigger())
        .pipe(gulp.dest('dist/'));
});

gulp.task('lint', function() {
    var jshint = require('gulp-jshint');
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jscs', function() {
    var jscs = require('gulp-jscs');
    return gulp.src('src/*.js')
        .pipe(jscs());
});

gulp.task('build-scripts', function() {
    var rigger = require('gulp-rigger');
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');
    var concat = require('gulp-concat');

    gulp.src('src/villain.js')
        .pipe(rigger())
        .pipe(gulp.dest('dist/'))
        .pipe(rename({suffix: '-min'}))
        .pipe(uglify())
        .on('error', function(err) { console.log(err.message); })
        .pipe(gulp.dest('dist/'));

    gulp.src(['./js/underscore.js', './js/backbone.js',
              './js/to-markdown.js', './js/markdown.min.js'])
        .pipe(concat('villain.vendor.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(rename({suffix: '-min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));

    gulp.src(['./dist/villain.vendor-min.js', './dist/villain-min.js'])
        .pipe(concat('villain.all-min.js'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['./dist/villain.vendor.js', './dist/villain.js'])
        .pipe(concat('villain.all.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['scripts', 'sass']);
gulp.task('build', ['build-scripts', 'build-sass']);
