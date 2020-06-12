const { src, dest, parallel, series } = require('gulp');
const minify = require('gulp-minify');
const zip = require('gulp-zip');

const packjs = () => src(['src/*.js'])
  .pipe(minify({ 
    noSource: true, 
    ext: {min: '.js'}
  }))
  .pipe(dest('build/'))

const packhtml = () => src(['src/*.html']).pipe(dest('build/'));

const packcss = () => src(['src/*.css']).pipe(dest('build/'));

const copyManifest = () => src(['src/manifest.json']).pipe(dest('build/'))

const copyImg = () => src(['src/images/**/*']).pipe(dest('build/images'))

const zipBuild = () => src('build/*').pipe(zip('build.zip')).pipe(dest('./'))

exports.default = series(
  parallel(
    packjs,
    packhtml,
    packcss,
    copyManifest,
    copyImg
  ),
  zipBuild
)
