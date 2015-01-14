module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n<%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n<%= pkg.description %>\nLovingly coded by <%= pkg.author.name %>  - <%= pkg.author.url %> \n*/\n',
		svgstore: {
			options: {
				prefix : 'icon-',
				svg: {
					viewBox : '0 0 100 100',
					xmlns: 'http://www.w3.org/2000/svg'
				}
			},
			dist: {
				files: {
					'img/icons.svg': ['img/svg/*.svg'],
				}
			}
		},
        less: {
            options: {
                paths: ['css/less']
            },
            front: {
                files: {
                    'css/main.css': 'css/less/main.less'
                }
            },
            back: {
                files: {
                    'css/back.css': 'css/less/back.less'
                }
            }
        },
		autoprefixer: {
			options: {
				map: true
			},
			front: {
				src: 'css/main.css',
				dest: 'css/main.css'
			},
			back: {
				src: 'css/back.css',
				dest: 'css/back.css'
			},
		},
        cssmin: {
            options: {
                banner: '<%= banner %>'
            },
            front: {
                files: {
                    'css/<%= pkg.name %>.min.css': ['css/normalize.css', 'css/fonts.css', 'css/main.css']
                }
            },
            back: {
                files: {
                    'css/<%= pkg.name %>.back.min.css': ['css/normalize.css', 'css/fonts.css', 'css/back.css', 'css/chosen.css']
                }
            }
        },
        concat: {
            options: {
                separator: '',
                stripBanners: {
                    block: true,
                    line: true
                },
                banner: '<%= banner %>'
            },
            front: {
                src: ['js/main.js'],
                dest: 'js/<%= pkg.name %>.js'
            },
            back: {
                src: ['js/lib/chosen.js', 'js/lib/fileupload.js', 'js/backdoor.js'],
                dest: 'js/<%= pkg.name %>.backdoor.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            front: {
                files: {
                    'js/<%= pkg.name %>.min.js': ['<%= concat.front.dest %>']
                }
            },
            back: {
                files: {
                    'js/<%= pkg.name %>.backdoor.min.js': ['<%= concat.back.dest %>']
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            less: {
                files: ['css/less/*.less'],
                tasks: ['less', 'autoprefixer', 'cssmin']
            },
            concat: {
                files: ['js/main.js', 'js/lib/*.js'],
                tasks: ['concat']
            },
            uglify: {
                files: ['js/<%= pkg.name %>.js'],
                tasks: ['uglify']
            },
            php: {
                files: '**/*.php',
            }
        }
    });
     
    grunt.registerTask('build', [
		'svgstore',
		'less',
		'autoprefixer',
        'cssmin',
        'concat',
        'uglify'
    ]);
     
    grunt.registerTask('dev', [
		'svgstore',
        'less',
		'autoprefixer',
        'cssmin',
        'concat',
        'uglify',
        'watch'
    ]);
 
    grunt.registerTask('default', 'build');
}