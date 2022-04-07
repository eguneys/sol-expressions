import * as t from '@babel/types'
import { createTemplate as createTemplateSOL } from '../sol/template'
import { transformElement as transformElementSOL } from '../sol/element'
import { 
  getConfig,
  getTagName,
  isComponent,
  isDynamic,
  transformCondition,
} from './utils'
import transformComponent from './component'
import transformFragmentChildren from './fragment'


export function transformJSX(path) {

  const config = getConfig(path)
  const replace = transformThis(path)
  const result = transformNode(
    path,
    t.isJSXFragment(path.node)
    ? {}: { topLevel: true }
  )

  const template = createTemplateSOL

  path.replaceWith(replace(template(path, result, false)))
}


export function transformThis(path) {
  let thisId
  path.traverse({
    ThisExpression(path) {
      thisId || (thisId = path.scope.generateUidIdentifier("self$"))
      path.replaceWith(thisId)
    }
  })

  return node => {
    if (thisId) {
      let parent = path.getStatementParent()
      const decl = t.variableDeclaration("const", [
        t.variableDeclarator(thisId, t.thisExpression())
      ])
      parent.insertBefore(decl)
    }
    return node
  }
}


export function transformNode(path, info = {}) {
  const config = getConfig(path)
  const node = path.node

  let staticValue
  if (t.isJSXElement(node)) {
    let tagName = getTagName(node)
    if (isComponent(tagName)) return transformComponent(path)
    const element =
      transformElementSOL
    return element(path, info)
  } else if (t.isJSXFragment(node)) {
    let results = { template: '', decl: [], exprs: [], dynamics: [] }

    transformFragmentChildren(path.get('children'), results, config)
    return results
  } else if (t.isJSXExpressionContainer(node)) {
    if (t.isJSXEmptyExpression(node.expression)) return null
    if (
      !isDynamic(path.get('expression'), {
        checkMember: true,
        checkTags: !!info.componentChild,
        native: !info.componentChild
      })
    ) {
      return { exprs: [node.expression], template: '' }
    }
    const expr = 
      config.wrapConditionals &&
      (t.isLogicalExpression(node.expression) || t.isConditionalExpression(node.expression))
    ? transformCondition(path.get('expression'), info.componentChild)
    : !info.componentChild &&
      (info.fragmentChild) &&
      t.isCallExpression(node.expression.callee) &&
      node.expression.arguments.length === 0
    ? node.expression.callee : t.arrowFunctionExpression([], node.expression)

    return {
      exprs:
      expr.length > 1
      ? [
        t.callExpression(
          t.arrowFunctionExpression(
            t.blockStatement([expr[0], t.returnStatement(expr[1])])
          ),
          []
        )
      ] : [expr],
      template: '',
      dynamic: true
    }
  } else {
  }
}
