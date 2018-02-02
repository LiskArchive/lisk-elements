module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		eslint: {
			target: ['src/**', 'test/**', '!test/mocha.opts', 'Gruntfile.js']
		},

		babel: {
			options: {
				sourceMap: true,
			},
			dist: {
				files: [{
					expand: true,
					cwd: './src',
					src: ['./**/*.js'],
					dest: './lib',
				}]
			}
		},

		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			js: {
				src: './lib/index.js',
				dest: './dist/lisk-js.js'
			},
			options: {
				browserifyOptions: {
					standalone: 'lisk'
				}
			}
		},

		watch: {
			scripts: {
				files: ['src/**/*.js'],
				tasks: ['eslint', 'babel', 'browserify'],
				options: {
					spawn: false,
					livereload: true
				},
			},
		},

		exec: {
			coverageSingle: {
				command: 'node_modules/.bin/istanbul cover --dir test/.coverage-unit ./node_modules/.bin/_mocha $TEST'
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			myTarget: {
				files: {
					'dist/lisk-js.min.js': ['dist/lisk-js.js']
				}
			}
		},

		coveralls: {
			src: 'test/.coverage-unit/*.info'
		}
	});

	grunt.registerTask('eslint-fix', 'Run eslint and fix formatting', function () {
		grunt.config.set('eslint.options.fix', true);
		grunt.task.run('eslint');
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-force');
	grunt.loadNpmTasks('grunt-coveralls');
	grunt.loadNpmTasks('grunt-babel');
	grunt.registerTask('jenkins', ['exec:coverageSingle', 'coveralls']);
	grunt.registerTask('eslint-ci', ['eslint']);
	grunt.registerTask('default', [
		'force:on',
		'eslint',
		'babel',
		'browserify',
		'uglify',
		'watch'
	]);
};
