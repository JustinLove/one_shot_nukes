# Preloaded NUkes

Nukes and anti-nukes are preloaded with one missile, and the metal cost is increased proportionally.  Stats are based on Titans.

(Extracted from Puppetmaster)

## Development

The generated project includes a `package.json` that lists the dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt copy:mod` will copy the mod files to `../../server_mods/identifier`, you can change the `modPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

- proc - modify nuke and antinuke units to preloaded versions
- copy:mod - copy the mod files into server_mods
- default: proc, copy:mod
