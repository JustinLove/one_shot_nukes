var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.one_shot_nukes/'
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
              'com.wondible.pa.one_shot_nukes/**',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
      icons: {
        files: [
          {
            src: media + 'pa/units/land/nuke_launcher/nuke_launcher_ammo_icon_buildbar.png',
            dest: 'pa/units/land/one_shot_nuke_launcher/one_shot_nuke_launcher_icon_buildbar.png',
          },
        ],
        files: [
          {
            src: media + 'pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo_icon_buildbar.png',
            dest: 'pa/units/land/one_shot_anti_nuke_launcher/one_shot_anti_nuke_launcher_icon_buildbar.png',
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
      unit_list: {
        src: [
          'pa_ex1/units/unit_list.json',
        ],
        cwd: media,
        dest: 'pa/units/unit_list.json',
        process: function(spec) {
          spec.units.push('/pa/units/land/one_shot_nuke_launcher/one_shot_nuke_launcher.json')
          spec.units.push('/pa/units/land/one_shot_anti_nuke_launcher/one_shot_anti_nuke_launcher.json')
          return spec
        }
      },
      nuke: {
        src: [
          'pa_ex1/units/land/nuke_launcher/nuke_launcher.json',
          'pa_ex1/units/land/nuke_launcher/nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/one_shot_nuke_launcher/one_shot_nuke_launcher.json',
        process: function(spec, ammo) {
          spec.display_name = ammo.display_name
          spec.description = ammo.description
          spec.build_metal_cost += ammo.build_metal_cost
          delete spec.buildable_projectiles
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          delete spec.factory.initial_build_spec
          delete spec.factory.default_build_stance
          delete spec.factory
          spec.unit_types = spec.unit_types.filter(function(type) {
            return type != "UNITTYPE_Factory"
          })
          spec.command_caps = spec.command_caps.filter(function(type) {
            return type != "ORDER_FactoryBuild"
          })
          //spec.model = [ { filename: "/pa/units/air/missile_nuke/missile_nuke.papa" } ]
          spec.si_name = "nuke_launcher_ammo"
          spec.tools[0].spec_id = '/pa/units/land/one_shot_nuke_launcher/one_shot_nuke_launcher_tool_weapon.json'
          spec.tools[0].aim_bone = 'bone_missile01'
          spec.tools.pop()
          spec.wreckage_health_frac = 0
          return spec
        }
      },
      nuke_tool: {
        src: [
          'pa/units/land/nuke_launcher/nuke_launcher_tool_weapon.json',
        ],
        cwd: media,
        dest: 'pa/units/land/one_shot_nuke_launcher/one_shot_nuke_launcher_tool_weapon.json',
        process: function(spec) {
          delete spec.ammo_source
          spec.self_destruct = true
          return spec
        }
      },
      antinuke: {
        src: [
          'pa_ex1/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
          'pa_ex1/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/one_shot_anti_nuke_launcher/one_shot_anti_nuke_launcher.json',
        process: function(spec, ammo) {
          spec.display_name = ammo.display_name
          spec.description = ammo.description
          spec.build_metal_cost += ammo.build_metal_cost
          delete spec.buildable_projectiles
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.factory.spawn_points.pop()
          spec.factory.spawn_points.pop()
          delete spec.factory.initial_build_spec
          delete spec.factory.default_build_stance
          delete spec.factory
          spec.unit_types = spec.unit_types.filter(function(type) {
            return type != "UNITTYPE_Factory"
          })
          spec.command_caps = spec.command_caps.filter(function(type) {
            return type != "ORDER_FactoryBuild"
          })
          //spec.model = [ { filename: "/pa/units/air/missile_anti_nuke/missile_anti_nuke.papa" } ]
          spec.si_name = "anti_nuke_launcher_ammo"
          spec.tools.shift()
          spec.tools[0].spec_id = '/pa/units/land/one_shot_anti_nuke_launcher/one_shot_anti_nuke_launcher_tool_weapon.json'
          spec.tools[0].aim_bone = 'socket_missile01'
          spec.tools[0].muzzle_bone = 'socket_missile01'
          spec.wreckage_health_frac = 0
          return spec
        }
      },
      antinuke_tool: {
        src: [
          'pa/units/land/anti_nuke_launcher/anti_nuke_launcher_tool_weapon.json',
        ],
        cwd: media,
        dest: 'pa/units/land/one_shot_anti_nuke_launcher/one_shot_anti_nuke_launcher_tool_weapon.json',
        process: function(spec) {
          delete spec.ammo_source
          spec.self_destruct = true
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

  grunt.registerTask('printPath', function() {
    console.log(media)
  });

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:icons', 'copy:mod', 'printPath']);

};

