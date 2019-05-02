import walk from '../modules/dat-walk.js'

let key = new URL(import.meta.url).hostname

export async function deepWalk (t) {
  let dat = await DatArchive.load(key)
  let file, walked = []

  for await (file of walk(dat)) {
    t.ok(await dat.stat(file), 'walked: ' + file)
    walked.push(file)
  }

  t.ok(walked.includes('dat.json'), 'includes dat.json')
  t.ok(walked.includes('modules/dat-walk.js'), 'includes modules/dat-walk.js')
  t.end()
}

export async function shallowWalk (t) {
  let dat = await DatArchive.load(key)
  let file, walked = []

  for await (file of walk(dat, {depth: 1})) {
    t.ok(file.split('/').length === 1, 'walked: ' + file)
  }
  t.end()
}