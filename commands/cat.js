import glob from '../modules/dat-glob.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, ...patterns) {
  var cwd = parsePath(window.location.pathname)
  var pattern, file
  
  for (pattern of patterns) {
    pattern = cwd.path ? joinPath(cwd.path, pattern) : pattern
    
    for await (file of glob(cwd.archive, pattern)) {
      yield cwd.archive.readFile(file)
    }
  }
}