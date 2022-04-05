import * as t from '@babel/types'
import { filterChildren } from './utils'
import { transformNode } from './transform'
import { createTemplate as createTemplateSOL } from '../sol/template'

export default function transformFragmentChildren(children, results, config) {
  const createTemplate = createTemplateSOL,
    filteredChildren = filterChildren(children),
    childNodes = filteredChildren.reduce((memo, path) => {
      if (t.isJSXText(path.node)) {
      } else {
        const child = transformNode(path, { topLevel: true, fragmentChild: true })
        memo.push(createTemplate(path, child, true))
      }
      return memo
    }, [])
  results.exprs.push(childNodes.length === 1? childNodes[0]: t.arrayExpression(childNodes))
}
