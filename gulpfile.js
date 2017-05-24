////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

var gulp = require('gulp'),
    electron = require('gulp-electron'),
    info = require('./src/package.json');

gulp.task('electron', function() {
    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: info,
        release: './dist',
        cache: './cache',
        version: 'v0.36.2',
        packaging: true,
        platforms: ['darwin-x64', 'win'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: info.name,
                CFBundleIdentifier: info.bundle,
                CFBundleName: info.name,
                CFBundleVersion: info.version,
                icon: 'logo.icns'
            },
            win: {
                "version-string": info.version,
                "file-version": info.version,
                "product-version": info.version,
                "icon": 'logo.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});
