module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var LIVERELOAD_PORT = 35729;
  var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
  var livereloadMiddleware = function (connect, options) {
    return [
      lrSnippet,
      connect.static(options.base),
      connect.directory(options.base)
    ];
  };

  var projectConfig = {
    app: 'app/',
    dist: 'dist/'
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('aws-keys.json'),
    project: projectConfig,
    connect: {
      server: {
        options: {
          port: '3000',
          base: '<%= project.app %>',
          livereload: true,
          middleware: livereloadMiddleware
        }
      }
    },
    watch: {
      server: {
        files: [ '<%= project.app %>**/*' ],
        tasks: [],
        options: {
          livereload: LIVERELOAD_PORT
        }
      },
      css: {
        files: [ '<%= project.app %>css/main.less' ],
        tasks: [ 'less' ],
        options: {
          livereload: true
        },
      }
    },
    open: {
      server: {
        url: 'http://localhost:3000'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= project.dist %>'
          ]
        }]
      },
      server: {
        files: [{
          src: [
            '.tmp'
          ]
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: './<%= project.app %>',
          dest: '<%= project.dist %>',
          src: [ '**', '!**/*.less', '!**/*.css', '!**/*.js' ]
        }]
      }
    },
    less: {
      options: {
        cleancss: false
      },
      files: {
        expand: false,
        src: '<%= project.app %>css/main.less',
        dest: '<%= project.app %>css/main.css'
      }
    },
    autoprefixer: {
      dist: {
        expand: true,
        cwd: '<%= project.dist %>',
        src: [ '**/*.css' ],
        dest: '<%= project.dist %>'
      }
    },
    useminPrepare: {
      html: [
        '<%= project.app %>*.html'
      ],
      options: {
        dest: '<%= project.dist %>',
        root: '<%= project.app %>'
      }
    },
    usemin: {
      html: [
        '<%= project.dist %>*.html'
      ],
      css: [
        '<%= project.dist %>css/*.css'
      ],
      options: {
        assetsDirs: [
          '<%= project.dist %>',
        ]
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= project.app %>images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= project.dist %>images'
        }]
      }
    },
    rev: {
      dist: {
        options: {
          encoding: 'utf8',
          algorithm: 'md5',
          length: 6
        },
        files: {
          src: [
            '<%= project.dist %>js/*.js',
            '<%= project.dist %>css/*.css',
            '<%= project.dist %>images/**/*.{jpg,jpeg,gif,png}',
          ]
        }
      }
    },
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.AWSAccessKeyId %>',
        secretAccessKey: '<%= aws.AWSSecretKey %>'
      },
      staging: {
        options: {
          differential: false,
          bucket: 'staging.baconseason.com',
          access: 'public-read',
          uploadConcurrency: 5,
          region: 'us-west-2' // Oregon
        },
        params: {
          "CacheControl": "630720000",
          "Expires": new Date(Date.now() + 63072000000).toUTCString(),
          "ContentEncoding": "gzip"
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.dist %>',
            src: [ '**' ],
            action: 'upload'
          }
        ]
      },
      prod: {
        options: {
          differential: false,
          bucket: 'baconseason.com',
          access: 'public-read',
          uploadConcurrency: 5,
          region: 'us-west-2' // Oregon
        },
        params: {
          "CacheControl": "630720000",
          "Expires": new Date(Date.now() + 63072000000).toUTCString(),
          "ContentEncoding": "gzip"
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.dist %>',
            src: [ '**' ],
            action: 'upload'
          }
        ]
      }
    },
    asciify: {
      dist: {
        options: {
          log: true
        },
        text: 'Modern Mast'
      }
    },
    usebanner: {
      dist_html: {
        options: {
          position: 'top',
          banner: '<!-- \n<%= asciify_dist %>\n<%= pkg.name %> v<%= pkg.version %>\n-->',
          linebreak: true
        },
        files: {
          src: [
            '<%= project.dist %>*.html'
          ]
        }
      },
      dist_assets: {
        options: {
          position: 'top',
          banner: '/*\n<%= asciify_dist %>\n<%= pkg.name %> v<%= pkg.version %>\n*/',
          linebreak: true
        },
        files: {
          src: [
            '<%= project.dist %>js/*.js',
            '<%= project.dist %>css/*.css'
          ]
        }
      }
    },
    gitcommit: {
      dist: {
        options: {
          message: grunt.option('message') || 'Changes',
          ignoreEmpty: true,
          all: true
        },
        files: {
          src: ['.']
        }
      }
    },
    gitpush: {
      staging: {
        options: {
          remote: 'github',
          branch: 'staging',
        }
      },
      prod: {
        options: {
          remote: 'github',
          branch: 'master'
        }
      }
    },
    bump: {
      options: {
        files: [ 'package.json' ],
        commit: false,
        createTag: false,
        push: false,
        updateConfigs: ['pkg', 'component']
      }
    },
    cloudfront_clear: {
      dist: {
        resourcePaths: [
          '/index.html'
        ],
        access_key: '<%= aws.AWSAccessKeyId %>',
        secret_key: '<%= aws.AWSSecretKey %>',
        dist: 'E3CW7QLLH1WSP6'
      }
    },
    uglify: {
      generated: {
        options: {
          mangle: {
            toplevel: true
          },
          compress: true
        }
      }
    }
  });

  grunt.registerTask('server', [
    'clean:server',
    'connect:server',
    'open',
    'watch'
  ]);

  grunt.registerTask('build', [
    'bump',
    'clean:dist',
    'useminPrepare',
    'less',
    'concat',
    'copy',
    'imagemin',
    'cssmin',
    'autoprefixer',
    'uglify',
    'rev',
    'usemin',
    'asciify',
    'usebanner:dist_assets',
    'usebanner:dist_html',
    'clean:server',
    'gitcommit'
  ]);

  grunt.registerTask('deploy_staging', [
    'aws_s3:staging',
    'gitpush:staging'
  ]);

  grunt.registerTask('deploy_prod', [
    'aws_s3:prod',
    'cloudfront_clear',
    'gitpush:prod'
  ]);

  grunt.registerTask('default', ['build']);
  grunt.registerTask('deploy-staging', ['deploy_staging']);
  grunt.registerTask('deploy-prod', ['deploy_prod']);
};
