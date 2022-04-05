import * as t from '@babel/types'
import { getConfig, registerImportMethod } from './utils'

import { appendTemplates as appendTemplatesSOL } from '../sol/template'

export default path => {
  const config = getConfig(path)


  if (path.scope.data.templates) {
    const appendTemplates = appendTemplatesSOL

    appendTemplates(path, path.scope.data.templates)
  }
}
