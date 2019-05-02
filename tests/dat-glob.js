import glob from '../modules/dat-glob.js'

export async function datGlob (t) {
  var key = new URL(import.meta.url).hostname
  var dat = await DatArchive.load(key)

  var indexes = await glob(dat, 'index.{html,js}').collect() 
  t.ok(indexes.includes('index.html'), 'find index.html')
  t.ok(indexes.includes('index.js'), 'find index.js')
  t.ok(indexes.length === 2, 'only two index files')

  var json = await glob(dat, '*.json').collect()
  t.ok(json.includes('dat.json'), 'find dat.json')
  t.ok(json.length === 1, 'only one json file')

  for await (var file of glob(dat, '**/*.js')) {
    t.ok(file.endsWith('.js'), 'find js: ' + file)
  }
  t.end()
}
