import glob from '../modules/dat-glob.js'

export async function datGlob (t) {
  let key = new URL(import.meta.url).hostname
  let dat = await DatArchive.load(key)

  let indexes = await glob(dat, 'index.{html,js}').collect() 
  t.ok(indexes.includes('index.html'), 'find index.html')
  t.ok(indexes.includes('index.js'), 'find index.js')
  t.ok(indexes.length === 2, 'only two index files')

  let json = await glob(dat, '*.json').collect()
  t.ok(json.includes('dat.json'), 'find dat.json')
  t.ok(json.length === 1, 'only one json file')

  for await (let file of glob(dat, '**/*.js')) {
    t.ok(file.endsWith('.js'), 'find js: ' + file)
  }
  t.end()
}
