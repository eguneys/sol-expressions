import * as t from '@babel/types'
import {
  getConfig,
  getTagName,
  isComponent,
  isDynamic,
  registerImportMethod,
  checkLength,
  getStaticExpression,
  filterChildren
} from '../shared/utils'
import { transformNode } from '../shared/transform'

import VoidElements from '../VoidElements'


export function transformElement(path, info) {
  let tagName = getTagName(path.node),
    config = getConfig(path),
    voidTag = VoidElements.indexOf(tagName) > -1,
    results = {
      template: `<${tagName}`,
      decl: [],
      exprs: [],
      dynamics: [],
      postExprs: [],
      tagName
    }

  if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$")
  transformAttributes(path, results)

  results.template += ">"

  if (!voidTag) {
    transformChildren(path, results, config)
    results.template += `</${tagName}>`
  }

  return results
}


function transformAttributes(path, results) {
  let elem = results.id,
    children,
    attributes = path.get('openingElement').get('attributes')

  const tagName = getTagName(path.node),
    hasChildren = path.node.children.length > 0,
    config = getConfig(path)

  path
  .get('openingElement')
  .get('attributes')
  .forEach(attribute => {

    const node = attribute.node
    

    let value = node.value,
      key = node.name.name

    if (key === 'ref') {
      while (
        t.isTSNonNullExpression(value.expression) ||
        t.isTSAsExpression(value.expression)
      ) {
        value.expression = value.expression.expression
      }

      let binding,
        isFunction =
        t.isIdentifier(value.expression) &&
        (binding = path.scope.getBinding(value.expression.name)) &&
        binding.kind === 'const'
      if (!isFunction && t.isLVal(value.expression)) {
        const refIdentifier = path.scope.generateUidIdentifier('_ref$')
        results.exprs.unshift(
          t.variableDeclaration('const', [
            t.variableDeclarator(refIdentifier, value.expression)
          ]),

          t.expressionStatement(
            t.conditionalExpression(
              t.binaryExpression(
                '===',
                t.unaryExpression('typeof', refIdentifier),
                t.stringLiteral('function')
              ),
              t.callExpression(refIdentifier, [elem]),
              t.assignmentExpression('=', value.expression, elem)
            )
          )
        )
      } else if (isFunction || t.isFunction(value.expression)) {
        results.exprs.unshift(
          t.expressionStatement(t.callExpression(value.expression, [elem]))
        )
      } else if (t.isCallExpression(value.expression)) {
        const refIdentifier = path.scope.generateUidIdentifier('_ref$')
        results.exprs.unshift(
          t.variableDeclration('const', [
            t.variableDeclration(refIdentifier, value.expression)
          ]),
          t.expressionStatement(
            t.logicalExpression(
              '&&',
              t.binaryExpression(
                '===',
                t.unaryExpression('typeof', refIdentifier),
                t.stringLiteral('function')
              ),
              t.callExpression(refIdentifier, [elem])
            )
          )
        )
      }
    } else if (key === 'children') {
      children = value
    } else if (config.effectWrapper &&
      isDynamic(attribute.get('value').get('expression'), {
        checkMember: true
      })
    ) {
      let nextElem = elem
      results.dynamics.push({ elem: nextElem, key, value: value.expression })
      } else {
        results.exprs.push(
          t.expressionStatement(setAttr(attribute, elem, key, value.expression, {}))
        )
      }
  })

  if (!hasChildren && children) {
    path.node.children.push(children)
  }
}


export function setAttr(path, elem, name, value, { dynamic }) {
  const config = getConfig(path)



  return t.callExpression(registerImportMethod(path, 'setAttribute'), [elem, t.stringLiteral(name), value])
}

function transformChildren(path, results, config) {
  let tempPath = results.id && results.id.name,
    tagName = getTagName(path.node),
    nextPlaceholder,
    i = 0

  const filteredChildren = filterChildren(path.get('children')),
    childNodes = filteredChildren
  .map((child, index) =>
    transformNode(child, {
      skipId: !results.id || !detectExpressions(filteredChildren, index, config)
    })
  )
  .reduce((memo, child) => {
    if (!child) return memo
    const i = memo.length
    if (child.text && i && memo[i - 1].text) {
      memo[i - 1].template += child.template
    } else memo.push(child)
    return memo
  }, [])


  childNodes.forEach((child, index) => {
    if (!child) return
    results.template += child.template
    if (child.id) {

      results.decl.push(...child.decl)
      results.exprs.push(...child.exprs)
      results.dynamics.push(...child.dynamics)

      tempPath = child.id.name
      nextPlaceholder = null
      i++
    } else if (child.exprs.length) {
      const insert = registerImportMethod(path, 'insert')
      const multi = checkLength(filteredChildren)

      if (multi) {
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(insert, [
              results.id,
              child.exprs[0],
              nextChild(childNodes, index) || t.nullLiteral()
            ])
          )
        )
      } else {
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(
              insert,
              [results.id, child.exprs[0]]
            )
          )
        )
      }
    } else nextPlaceholder = null
  })
}


function detectExpressions(children, index, config) {
  if (children[index - 1]) {
  }
  for (let i = index; i < children.length; i++) {
    const child = children[i].node
    if (t.isJSXExpressionContainer(child)) {
      if (!t.isJSXEmptyExpression(child.expression) && !getStaticExpression(children[i]))
        return true
    } else if (t.isJSXElement(child)) {
      const tagName = getTagName(child)
      if (isComponent(tagName)) return true

      const nextChildren = filterChildren(children[i].get('children'))
      if (nextChildren.length) if (detectExpressions(nextChildren, 0, config)) return true
    }
  }
}

function nextChild(children, index) {
  return children[index + 1] && (children[index + 1].id || nextChild(children, index + 1))
}
