var fs = require('fs');
var gulp = require('gulp');
var cp = require('child_process');
var path = require('path');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');
var notifier = require('node-notifier');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var envify = require('envify/custom');
var babelify = require('babelify');
var jstify = require('jstify');

/// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Variables --------------------------------------//
// ----------------------------------------------------------------------------//

// The package.json
var pkg;
var shouldReload = true;
var jekyllLimit = null;
var environment = 'development';

/// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Helper functions ---------------------------------//
// ----------------------------------------------------------------------------//

function readPackage () {
  pkg = JSON.parse(fs.readFileSync('package.json'));
}
readPackage();

/// /////////////////////////////////////////////////////////////////////////////
// -------------------------- Copy tasks --------------------------------------//
// ----------------------------------------------------------------------------//

// Copy from the .tmp to _site directory.
// To reduce build times the assets are compiles at the same time as jekyll
// renders the site. Once the rendering has finished the assets are copied.
gulp.task('copy:assets', function (done) {
  return gulp.src('.tmp/assets/**')
    .pipe(gulp.dest('_site/assets'));
});

/// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Browserify tasks ---------------------------------//
// ------------------- (Not to be called directly) ----------------------------//
// ----------------------------------------------------------------------------//

// Compiles the user's script files to bundle.js.
gulp.task('javascript', function () {
  var b = browserify({
    entries: ['./app/assets/scripts/main.js'],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  });

  b.transform(babelify, {presets: [["@babel/preset-env", {"targets": "> 0.25%, not dead"}]]});
  b.transform(jstify);
  b.transform(envify({
    NODE_ENV: environment,
    global: true
  }));

  var watcher = watchify(b);

  function bundler () {
    return watcher.bundle()
      .on('error', function (e) {
        notifier.notify({
          title: 'Oops! Browserify errored:',
          message: e.message
        });
        console.log('Sass error:', e);
        // Allows the watch to continue.
        this.emit('end');
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(uglify())
    // Source maps.
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/assets/scripts'))
      .pipe(reload({ stream: true }));
  }

  watcher
    .on('log', gutil.log)
    .on('update', bundler);

  return bundler();
});

/// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Assets tasks -----------------------------------//
// ----------------------------------------------------------------------------//

gulp.task('styles', function () {
  return gulp.src('app/assets/styles/main.scss')
    .pipe(plumber(function (e) {
      notifier.notify({
        title: 'Oops! Sass errored:',
        message: e.message
      });
      console.log('Sass error:', e.toString());
      // Allows the watch to continue.
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: require('node-bourbon').includePaths.concat(require('node-neat').includePaths),
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/assets/styles'))
    .pipe(reload({ stream: true }));
});

// Build the jekyll website.
gulp.task('jekyll', function (done) {
  var args = ['exec', 'jekyll', 'build'];

  switch (environment) {
    case 'development':
      args.push('--config=_config.yml,_config-dev.yml');
      break;
    case 'stage':
      args.push('--config=_config.yml,_config-stage.yml');
      break;
    case 'production':
      args.push('--config=_config.yml');
      break;
  }

  if (jekyllLimit != null) {
    args.push('--limit_posts=' + jekyllLimit);
  }

  return cp.spawn('bundle', args, { stdio: 'inherit' })
    .on('close', done);
});

////////////////////////////////////////////////////////////////////////////////
//------------------------- Environment tasks --------------------------------//
//----------------------------------------------------------------------------//

gulp.task('site', gulp.series('jekyll', 'javascript', 'styles'));
gulp.task('copy', gulp.series('copy:assets'));

// Main build task
// Builds the site. Destination --> _site
gulp.task('build', gulp.series('site', 'copy'));

/// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Callable tasks ---------------------------------//
// ----------------------------------------------------------------------------//

// Builds the website, watches for changes and starts browserSync.
gulp.task('serve', gulp.series('build', function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', '_site'],
      routes: {
        '/node_modules': './node_modules'
      }
    }
  });

  gulp.watch('app/assets/styles/**/*.scss', gulp.series('styles'));

  gulp.watch(['app/**/*.html', 'app/**/*.md', 'app/**/*.json', 'app/**/*.geojson'], gulp.series('jekyll', 'copy:assets', browserReload));
}));

// Default task.
// Builds the website, watches for changes and starts browserSync.
gulp.task('default', gulp.series('build', function(done) {
  done();
  process.exit(0);
}));

gulp.task('prod', gulp.series(
  function(done) {
    environment = 'production';
    done();
  },
  'build',
  function(done) {
    done();
    process.exit(0);
  }));

gulp.task('stage', gulp.series(
  function(done) {
    environment = 'stage';
    done();
  },
  'build',
  function(done) {
    done();
    process.exit(0);
  }));

// Removes temp folders.
gulp.task('clean', function () {
  return gulp.src(['_site', '.tmp/'], { read: false })
    .pipe(clean());
});

/// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Helper functions ---------------------------------//
// ----------------------------------------------------------------------------//

function browserReload () {
  if (shouldReload) { reload(); }
}
