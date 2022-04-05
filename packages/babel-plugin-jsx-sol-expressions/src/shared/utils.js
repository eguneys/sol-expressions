import * as t from '@babel/types'

import { addNamed } from '@babel/helper-module-imports'

export function getConfig(path) {
  return path.hub.file.metadata.config
}

export function registerImportMethod(path, name) {
  const imports =
    path.scope.getProgramParent().data.imports ||
    (path.scope.getProgramParent().data.imports = new Set())
  const identifier = t.identifier(`_$${name}`)
  if (!imports.has(name)) {
    addNamed(path, name, getConfig(path).moduleName, {
      nameHint: `_$${name}`
    })
    imports.add(name)
  }
  return identifier
}


function jsxElementNameToString(node) {
  if (t.isJSXMemberExpression(node)) {
    return `${jsxElementNameToString(node.object)}.${node.property.name}`
  }
  if (t.isJSXIdentifier(node) || t.isIdentifier(node)) {
    return node.name
  }
  return `${node.namespace.name}:${node.name.name}`
}

export function getTagName(tag) {
  const jsxName = tag.openingElement.name
  return jsxElementNameToString(jsxName)
}

export function isComponent(tagName) {
  return (
    (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
      tagName.includes('.') ||
      /[^a-zA-Z]/.test(tagName[0])
  )
}

export function filterChildren(children) {
  return children.filter(
    ({ node: child }) => 
    !(t.isJSXExpressionContainer(child) && t.isJSXEmptyExpression(child.expression)) &&
    (!t.isJSXText(child) || !/^[\r\n]\s*$/.test(child.extra.raw))
  )
}


export function isDynamic(path, { checkMember, checkTags, checkCallExpressions = true, native }) {
  const config = getConfig(path)
  const expr = path.node
  if (t.isFunction(expr)) return false
  if ((checkCallExpressions && t.isCallExpression(expr)) ||
    (checkMember && (t.isMemberExpression(expr) || t.isOptionalMemberExpression(expr))) ||
    (checkTags && (t.isJSXElement(expr) || t.isJSXFragment(expr)))) {
    return true
  }


  let dynamic

  path.traverse({
    Function(p) {
      if (t.isObjectMethod(p.node) && p.node.computed) {
        dynamic = isDynamic(p.get('key'), { checkMember, checkTags, checkCallExpressions, native })
      }
      p.skip()
    },
    CallExpression(p) {
      checkCallExpressions && (dynamic = true) && p.stop()
    },
    MemberExpression(p) {
      checkMember && (dynamic = true) && p.stop()
    },
    OptionalMemberExpression(p) {
      checkMember && (dynamic = true) && p.stop()
    },
    JSXElement(p) {
      checkTags ? (dynamic = true) && p.stop(): p.skip()
    },
    JSXFragment(p) {
      checkTags ? (dynamic = true) && p.stop() : p.skip()
    }
  })


  return dynamic
}


export function transformCondition(path, inline, deep) {
  const config = getConfig(path)
  const expr = path.node
  const memo = registerImportMethod(path, config.memoWrapper)
  let dTest, cond, id

  if (t.isConditionalExpression(expr) &&
    (isDynamic(path.get('consequent'), {
      checkTags: true
    }) ||
      isDynamic(path.get('alternate'), { checkTags: true }))) {
    dTest = isDynamic(path.get('test'), { checkMember: true })

    if (dTest) {
      cond = expr.test
      if (!t.isBinaryExpression(cond)) {
        cond = t.unaryExpression('!', t.unaryExpression('!', cond, true), true)
      }
      id = inline
        ? t.callExpression(memo, [
          t.arrowFunctionExpression([], cond),
          t.booleanLiteral(true)
        ])
        : path.scope.generaateUidIdentifier('_c$')
      expr.test = t.callExpression(id, [])

      if (t.isConditionalExpression(expr.alternate) || t.isLogicalExpression(expr.alternate)) {
        expr.alternate = transformCondition(path.get('alternate'), inline, true)
      }
    }
  } else if (t.isLogicalExpression(expr)) {
    let nextPath = path

    while (nextPath.node.operator !== '&&' && t.isLogicalExpression(nextPath.node.left)) {
      nextPath = nextPath.get('left')
    }
    nextPath.node.operator === '&&' &&
      isDynamic(nextPath.get('right'), { checkTags: true }) &&
      (dTest = isDynamic(nextPath.get('left'), {
        checkMember: true
      }))

    if (dTest) {
      cond = nextPath.node.left

      if (!t.isBinaryExpression(cond)) {
        cond = t.unaryExpression('!', t.unaryExpression('!', cond, true), true)
      }
      id = inline
        ? t.callExpression(memo, [
          t.arrowFunctionExpression([], cond),
          t.booleanLiteral(true)
        ])
        : path.scope.generaateUidIdentifier('_c$')
      nextPath.node.left = t.callExpression(id, [])
    }
  }

  if (dTest && !inline) {
    const statements = [
    ]

    return deep
      ? t.callExpression(
        t.arrowFunctionExpression(
          [],
          t.blockStatement([statements[0], t.returnStatement(statements[1])]))
      ) : statements
  }
  return deep ? expr : t.arrowFunctionExpression([], expr)
}


export function checkLength(children) {
  let i = 0
  children.forEach(path => {
    const child = path.node
    !(t.isJSXExpressionContainer(child) && t.isJSXEmptyExpression(child.expression)) &&
      (!t.isJSXText(child) || !/^\s*$/.test(child.extra.raw)) &&
      i++
  })
  return i > 1
}

export function getStaticExpression(path) {
  const node = path.node
  let value, type
  return (
    t.isJSXExpressionContainer(node) &&
    t.isJSXElement(path.parent) &&
    !isComponent(getTagName(path.parent)) &&
      (value = path.get('expression').evaluate().value) !== undefined &&
      ((type = typeof value) === 'string' || type === 'number') &&
      value
  )
}
