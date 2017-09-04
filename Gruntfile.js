var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.preloaded_nukes/'
var stream = 'stable'
var media = require('./lib/path').media(stream)
var build = 'ui/main/shared/js/build.js'

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'com.wondible.pa.preloaded_nukes/**',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
    },
    jsonlint: {
      all: {
        src: [
          'pa/ammo/**/*.json',
          'pa/tools/**/*.json',
          'pa/units/**/*.json'
        ]
      },
    },
    json_schema: {
      all: {
        files: {
          'lib/schema.json': [
            'pa/ammo/**/*.json',
            'pa/tools/**/*.json',
            'pa/units/**/*.json'
          ]
        },
      },
    },
    proc: {
      nuke: {
        src: [
          'pa_ex1/units/land/nuke_launcher/nuke_launcher.json',
          'pa_ex1/units/land/nuke_launcher/nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/nuke_launcher/nuke_launcher.json',
        process: function(spec, ammo) {
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.build_metal_cost += ammo.build_metal_cost
          return spec
        }
      },
      antinuke: {
        src: [
          'pa_ex1/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
          'pa_ex1/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
        process: function(spec, ammo) {
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.build_metal_cost += ammo.build_metal_cost
          return spec
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

