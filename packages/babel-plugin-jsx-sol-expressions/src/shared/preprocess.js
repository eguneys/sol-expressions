import config from '../config'

export default (path, { opts }) => {
  const merged = path.hub.file.metadata.config = Object.assign({}, config, opts)

  const lib = merged.requireImportSource

  if (lib) {

  }
}
