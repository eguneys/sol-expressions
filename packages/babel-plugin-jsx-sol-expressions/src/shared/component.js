import * as t from '@babel/types'

import {
  getConfig,
  filterChildren,
  isDynamic,
  registerImportMethod,
  transformCondition
} from './utils'

import { transformNode } from './transform'
import { createTemplate as createTemplateSOL } from '../sol/template'

function convertComponentIdentifier(node) {
  if (t.isJSXIdentifier(node)) {
    if (t.isValidIdentifier(node.name)) node.type = 'Identifier'
    else return t.stringLiteral(node.name)
  } else if (t.isJSXMemberExpression(node)) {
    const prop = convertComponentIdentifier(node.property)
    const computed = t.isStringLiteral(prop)
    return t.memberExpression(convertComponentIdentifier(node.object), prop, computed)
  }
  return node
}

export default function transformComponent(path) {
  let exprs = [],
    config = getConfig(path),
    tagId = convertComponentIdentifier(path.node.openingElement.name),
    props = [],
    runningObject = [],
    dynamicSpread = false,
    hasChildren = path.node.children.length > 0

  path
    .get('openingElement')
    .get('attributes')
  .forEach(attribute => {
    const node = attribute.node
    
    if (t.isJSXSpreadAttribute(node)) {
    } else {
      const value = node.value || t.booleanLiteral(true),
        id = convertJSXIdentifier(node.name),
        key = id.name

      if (hasChildren && key === 'children') return

      if (t.isJSXExpressionContainer(value)) {

        if (key === 'ref') {
        } else if (
          isDynamic(attribute.get('value').get('expression'), {
            checkMember: true,
            checkTags: true
          })
        ) {


          let expr =
            config.wrapConditionals &&
            (t.isLogicalExpression(value.expression) ||
              t.isConditionalExpression(value.expression))
          ? transformCondition(attribute.get('value').get('expression'), true)
          : t.arrowFunctionExpression([], value.expression)

          runningObject.push(
            t.objectMethod(
              'get',
              id,
              [],
              t.blockStatement([t.returnStatement(expr.body)]),
              !t.isValidIdentifier(key)
          ))

        } else { runningObject.push(t.objectProperty(id, value.expression)) }
      }
    }


  })

  const childResult = transformComponentChildren(path.get('children'), config)
  if (childResult && childResult[0]) {
    if (childResult[1]) {

      const body =
        t.isCallExpression(childResult[0]) && t.isFunction(childResult[0].callee)
      ? childResult[0].callee.body
      : childResult[0].body

      runningObject.push(
        t.objectMethod('get', 
          t.identifier('children'), 
          [], 
          t.isExpression(body) ? t.blockStatement([t.returnStatement(body)]): body
        ))
    } else {
      //runningObject.push(t.objectProperty(t.identifier('children'), childResult[0]))
    }
  }

  if (runningObject.length || !props.length) props.push(t.objectExpression(runningObject))


  const componentArgs = [tagId, props[0]]
  exprs.push(t.callExpression(registerImportMethod(path, 'createComponent'), componentArgs))

  return { exprs, template: "", component: true }
}

function transformComponentChildren(children, config) {
  const createTemplate = createTemplateSOL,
  filteredChildren = filterChildren(children)

  if (!filteredChildren.length) return
  let dynamic = false

  let transformedChildren = filteredChildren.reduce((memo, path) => {
    if (t.isJSXText(path.node)) {
    } else {
      const child = transformNode(path, {
        topLevel: true,
        componentChild: true
      })
      dynamic = dynamic || child.dynamic
      memo.push(createTemplate(path, child, filteredChildren.length > 1))
    }
    return memo
  }, [])

  if (transformedChildren.length === 1) {
    transformedChildren = transformedChildren[0]

    if (!t.isJSXExpressionContainer(filteredChildren[0]) &&
      !t.isJSXSpreadChild(filterChildren[0]) &&
      !t.isJSXText(filterChildren[0])) {
      transformedChildren = 
        t.isCallExpression(transformedChildren) &&
        !transformedChildren.arguments.length &&
        !t.isIdentifier(transformedChildren.callee)
      ? transformedChildren.callee
      : t.arrowFunctionExpression([], transformedChildren)
      dynamic = true
    }
  }

  return [transformedChildren, dynamic]
}

function convertJSXIdentifier(node) {
  if (t.isJSXIdentifier(node)) {
    if (t.isValidIdentifier(node.name)) {
      node.type = 'Identifier'
    } else {
      return t.stringLiteral(node.name)
    }
  } else if (t.isJSXMemberExpression(node)) {
    return t.memberExpression(
      convertJSXIdentifier(node.object),
      convertJSXIdentifier(node.property)
    )
  }
  return node
}
