'use strict';

var SyntaxJSX = require('@babel/plugin-syntax-jsx');
var t = require('@babel/types');
var helperModuleImports = require('@babel/helper-module-imports');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var SyntaxJSX__default = /*#__PURE__*/_interopDefaultLegacy(SyntaxJSX);
var t__namespace = /*#__PURE__*/_interopNamespace(t);

function getConfig(path) {
  return path.hub.file.metadata.config
}

function registerImportMethod(path, name) {
  const imports =
    path.scope.getProgramParent().data.imports ||
    (path.scope.getProgramParent().data.imports = new Set());
  const identifier = t__namespace.identifier(`_$${name}`);
  if (!imports.has(name)) {
    helperModuleImports.addNamed(path, name, getConfig(path).moduleName, {
      nameHint: `_$${name}`
    });
    imports.add(name);
  }
  return identifier
}


function jsxElementNameToString(node) {
  if (t__namespace.isJSXMemberExpression(node)) {
    return `${jsxElementNameToString(node.object)}.${node.property.name}`
  }
  if (t__namespace.isJSXIdentifier(node) || t__namespace.isIdentifier(node)) {
    return node.name
  }
  return `${node.namespace.name}:${node.name.name}`
}

function getTagName(tag) {
  const jsxName = tag.openingElement.name;
  return jsxElementNameToString(jsxName)
}

function isComponent(tagName) {
  return (
    (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
      tagName.includes('.') ||
      /[^a-zA-Z]/.test(tagName[0])
  )
}

function filterChildren(children) {
  return children.filter(
    ({ node: child }) => 
    !(t__namespace.isJSXExpressionContainer(child) && t__namespace.isJSXEmptyExpression(child.expression)) &&
    (!t__namespace.isJSXText(child) || !/^[\r\n]\s*$/.test(child.extra.raw))
  )
}


function isDynamic(path, { checkMember, checkTags, checkCallExpressions = true, native }) {
  getConfig(path);
  const expr = path.node;
  if (t__namespace.isFunction(expr)) return false
  if ((checkCallExpressions && t__namespace.isCallExpression(expr)) ||
    (checkMember && (t__namespace.isMemberExpression(expr) || t__namespace.isOptionalMemberExpression(expr))) ||
    (checkTags && (t__namespace.isJSXElement(expr) || t__namespace.isJSXFragment(expr)))) {
    return true
  }


  let dynamic;

  path.traverse({
    Function(p) {
      if (t__namespace.isObjectMethod(p.node) && p.node.computed) {
        dynamic = isDynamic(p.get('key'), { checkMember, checkTags, checkCallExpressions, native });
      }
      p.skip();
    },
    CallExpression(p) {
      checkCallExpressions && (dynamic = true) && p.stop();
    },
    MemberExpression(p) {
      checkMember && (dynamic = true) && p.stop();
    },
    OptionalMemberExpression(p) {
      checkMember && (dynamic = true) && p.stop();
    },
    JSXElement(p) {
      checkTags ? (dynamic = true) && p.stop(): p.skip();
    },
    JSXFragment(p) {
      checkTags ? (dynamic = true) && p.stop() : p.skip();
    }
  });


  return dynamic
}


function transformCondition(path, inline, deep) {
  const config = getConfig(path);
  const expr = path.node;
  const memo = registerImportMethod(path, config.memoWrapper);
  let dTest, cond, id;

  if (t__namespace.isConditionalExpression(expr) &&
    (isDynamic(path.get('consequent'), {
      checkTags: true
    }) ||
      isDynamic(path.get('alternate'), { checkTags: true }))) {
    dTest = isDynamic(path.get('test'), { checkMember: true });

    if (dTest) {
      cond = expr.test;
      if (!t__namespace.isBinaryExpression(cond)) {
        cond = t__namespace.unaryExpression('!', t__namespace.unaryExpression('!', cond, true), true);
      }
      id = inline
        ? t__namespace.callExpression(memo, [
          t__namespace.arrowFunctionExpression([], cond),
          t__namespace.booleanLiteral(true)
        ])
        : path.scope.generaateUidIdentifier('_c$');
      expr.test = t__namespace.callExpression(id, []);

      if (t__namespace.isConditionalExpression(expr.alternate) || t__namespace.isLogicalExpression(expr.alternate)) {
        expr.alternate = transformCondition(path.get('alternate'), inline, true);
      }
    }
  } else if (t__namespace.isLogicalExpression(expr)) {
    let nextPath = path;

    while (nextPath.node.operator !== '&&' && t__namespace.isLogicalExpression(nextPath.node.left)) {
      nextPath = nextPath.get('left');
    }
    nextPath.node.operator === '&&' &&
      isDynamic(nextPath.get('right'), { checkTags: true }) &&
      (dTest = isDynamic(nextPath.get('left'), {
        checkMember: true
      }));

    if (dTest) {
      cond = nextPath.node.left;

      if (!t__namespace.isBinaryExpression(cond)) {
        cond = t__namespace.unaryExpression('!', t__namespace.unaryExpression('!', cond, true), true);
      }
      id = inline
        ? t__namespace.callExpression(memo, [
          t__namespace.arrowFunctionExpression([], cond),
          t__namespace.booleanLiteral(true)
        ])
        : path.scope.generaateUidIdentifier('_c$');
      nextPath.node.left = t__namespace.callExpression(id, []);
    }
  }

  if (dTest && !inline) {
    const statements = [
    ];

    return deep
      ? t__namespace.callExpression(
        t__namespace.arrowFunctionExpression(
          [],
          t__namespace.blockStatement([statements[0], t__namespace.returnStatement(statements[1])]))
      ) : statements
  }
  return deep ? expr : t__namespace.arrowFunctionExpression([], expr)
}


function checkLength(children) {
  let i = 0;
  children.forEach(path => {
    const child = path.node;
    !(t__namespace.isJSXExpressionContainer(child) && t__namespace.isJSXEmptyExpression(child.expression)) &&
      (!t__namespace.isJSXText(child) || !/^\s*$/.test(child.extra.raw)) &&
      i++;
  });
  return i > 1
}

function getStaticExpression(path) {
  const node = path.node;
  let value, type;
  return (
    t__namespace.isJSXExpressionContainer(node) &&
    t__namespace.isJSXElement(path.parent) &&
    !isComponent(getTagName(path.parent)) &&
      (value = path.get('expression').evaluate().value) !== undefined &&
      ((type = typeof value) === 'string' || type === 'number') &&
      value
  )
}

var VoidElements = [];

function transformElement(path, info) {
  let tagName = getTagName(path.node);
    getConfig(path);
    let voidTag = VoidElements.indexOf(tagName) > -1,
    results = {
      template: `<${tagName}`,
      decl: [],
      exprs: [],
      dynamics: [],
      postExprs: [],
      tagName
    };

  if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$");
  transformAttributes(path, results);

  results.template += ">";

  if (!voidTag) {
    transformChildren(path, results);
    results.template += `</${tagName}>`;
  }

  return results
}


function transformAttributes(path, results) {
  let elem = results.id,
    children;
    path.get('openingElement').get('attributes');

  getTagName(path.node);
    const hasChildren = path.node.children.length > 0,
    config = getConfig(path);

  path
  .get('openingElement')
  .get('attributes')
  .forEach(attribute => {

    const node = attribute.node;
    

    let value = node.value,
      key = node.name.name;

    if (key === 'children') {
      children = value;
    } else if (config.effectWrapper &&
      isDynamic(attribute.get('value').get('expression'), {
        checkMember: true
      })
    ) {
      let nextElem = elem;
      results.dynamics.push({ elem: nextElem, key, value: value.expression });
      } else {
        results.exprs.push(
          t__namespace.expressionStatement(setAttr(attribute, elem, key, value.expression, {}))
        );
      }
  });

  if (!hasChildren && children) {
    path.node.children.push(children);
  }
}


function setAttr(path, elem, name, value, { dynamic }) {
  getConfig(path);



  return t__namespace.callExpression(registerImportMethod(path, 'setAttribute'), [elem, t__namespace.stringLiteral(name), value])
}

function transformChildren(path, results, config) {
  results.id && results.id.name;
    getTagName(path.node);

  const filteredChildren = filterChildren(path.get('children')),
    childNodes = filteredChildren
  .map((child, index) =>
    transformNode(child, {
      skipId: !results.id || !detectExpressions(filteredChildren, index)
    })
  )
  .reduce((memo, child) => {
    if (!child) return memo
    const i = memo.length;
    if (child.text && i && memo[i - 1].text) {
      memo[i - 1].template += child.template;
    } else memo.push(child);
    return memo
  }, []);


  childNodes.forEach((child, index) => {
    if (!child) return
    results.template += child.template;
    if (child.id) {

      results.decl.push(...child.decl);
      results.exprs.push(...child.exprs);
      results.dynamics.push(...child.dynamics);

      child.id.name;
    } else if (child.exprs.length) {
      const insert = registerImportMethod(path, 'insert');
      const multi = checkLength(filteredChildren);

      if (multi) {
        results.exprs.push(
          t__namespace.expressionStatement(
            t__namespace.callExpression(insert, [
              results.id,
              child.exprs[0],
              nextChild(childNodes, index) || t__namespace.nullLiteral()
            ])
          )
        );
      } else {
        results.exprs.push(
          t__namespace.expressionStatement(
            t__namespace.callExpression(
              insert,
              [results.id, child.exprs[0]]
            )
          )
        );
      }
    } else ;
  });
}


function detectExpressions(children, index, config) {
  if (children[index - 1]) ;
  for (let i = index; i < children.length; i++) {
    const child = children[i].node;
    if (t__namespace.isJSXExpressionContainer(child)) {
      if (!t__namespace.isJSXEmptyExpression(child.expression) && !getStaticExpression(children[i]))
        return true
    } else if (t__namespace.isJSXElement(child)) {
      const tagName = getTagName(child);
      if (isComponent(tagName)) return true

      const nextChildren = filterChildren(children[i].get('children'));
      if (nextChildren.length) if (detectExpressions(nextChildren, 0)) return true
    }
  }
}

function createTemplate(path, result, wrap) {
  const config = getConfig(path);

  if (result.id) {
    registerTemplate(path, result);

    if (!(result.exprs.length || result.dynamics.length || result.postExprs.length) && result.decl.declarations.length === 1) {
      return result.decl.declarations[0].init
    } else {
      return t__namespace.callExpression(
        t__namespace.arrowFunctionExpression(
          [],
          t__namespace.blockStatement([
            result.decl,
            ...result.exprs.concat(
              wrapDynamics(path, result.dynamics) || [],
              result.postExprs || []
            ),
            t__namespace.returnStatement(result.id)
          ])
        ),
        []
      )
    }
  }
  if (wrap && result.dynamic && config.memoWrapper) {
    return t__namespace.callExpression(registerImportMethod(path, config.memoWrapper), [result.exprs[0]])
  }
  return result.exprs[0]
}

function appendTemplates(path, templates) {
  const declarators = templates.map(template => {
    const tmpl = {
      cooked: template.template,
      raw: template.template
    };
    return t__namespace.variableDeclarator(
      template.id,
      t__namespace.addComment(
        t__namespace.callExpression(
          registerImportMethod(path, 'template'),
          [
            t__namespace.templateLiteral([t__namespace.templateElement(tmpl, true)], []),
            t__namespace.numericLiteral(template.elementCount)
          ]
        ),
        'leading',
        '#__PURE__'
      )
    )
  });
  path.node.body.unshift(t__namespace.variableDeclaration('const', declarators));
}

function registerTemplate(path, results) {
  let decl;
  if (results.template.length) {
    let templateDef, templateId;

    if (!results.skipTemplate) {

      const templates =
        path.scope.getProgramParent().data.templates ||
        (path.scope.getProgramParent().data.templates = []);
      if ((templateDef = templates.find(t => t.template === results.template))) {
        templateId = templateDef.id;
      } else {
        templateId = path.scope.generateUidIdentifier('tmpl$');
        templates.push({
          id: templateId,
          template: results.template,
          elementCount: results.template.split('<').length - 1
        });
      }
    }
    decl = t__namespace.variableDeclarator(
      results.id,
      t__namespace.memberExpression(templateId, t__namespace.identifier('clone'))
    );
  }
  results.decl.unshift(decl);
  results.decl = t__namespace.variableDeclaration('const', results.decl);
}

function wrapDynamics(path, dynamics) {
  if (!dynamics.length) return
  const config = getConfig(path);

  const effectWrapperId = registerImportMethod(path, config.effectWrapper);

  if (dynamics.length === 1) {
    const prevValue = undefined;

    return t__namespace.expressionStatement(
      t__namespace.callExpression(effectWrapperId, [
        t__namespace.arrowFunctionExpression(
          [],
          setAttr(path, dynamics[0].elem, dynamics[0].key, dynamics[0].value, {
            dynamic: true,
            prevId: prevValue
          }))
      ])
    )
  }

  const decls = [],
    statements = [],
    identifiers = [],
    prevId = t__namespace.identifier('_p$');

  dynamics.forEach(({ elem, key, value }) => {
    const identifier = path.scope.generateUidIdentifier("v$");
    identifiers.push(identifier);
    decls.push(t__namespace.variableDeclarator(identifier, value));
    {
      statements.push(
        t__namespace.expressionStatement(
          t__namespace.logicalExpression(
            '&&',
            t__namespace.binaryExpression('!==', identifier, t__namespace.memberExpression(prevId, identifier)),
            setAttr(
              path,
              elem,
              key,
              t__namespace.assignmentExpression('=', t__namespace.memberExpression(prevId, identifier), identifier),
              { dynamic: true }
            )
          )
        )
      );
    }
  });

  return t__namespace.expressionStatement(
    t__namespace.callExpression(effectWrapperId, [

      t__namespace.arrowFunctionExpression(
        [prevId],
        t__namespace.blockStatement([
          t__namespace.variableDeclaration('const', decls),
          ...statements,
          t__namespace.returnStatement(prevId)
        ])
      ),
      t__namespace.objectExpression(identifiers.map(id => t__namespace.objectProperty(id, t__namespace.identifire('undefined'))))
    ])
  )
}

function convertComponentIdentifier(node) {
  if (t__namespace.isJSXIdentifier(node)) {
    if (t__namespace.isValidIdentifier(node.name)) node.type = 'Identifier';
    else return t__namespace.stringLiteral(node.name)
  } else if (t__namespace.isJSXMemberExpression(node)) {
    const prop = convertComponentIdentifier(node.property);
    const computed = t__namespace.isStringLiteral(prop);
    return t__namespace.memberExpression(convertComponentIdentifier(node.object), prop, computed)
  }
  return node
}

function transformComponent(path) {
  let exprs = [],
    config = getConfig(path),
    tagId = convertComponentIdentifier(path.node.openingElement.name),
    props = [],
    runningObject = [],
    hasChildren = path.node.children.length > 0;

  path
    .get('openingElement')
    .get('attributes')
  .forEach(attribute => {
    const node = attribute.node;
    
    if (t__namespace.isJSXSpreadAttribute(node)) ; else {
      const value = node.value || t__namespace.booleanLiteral(true),
        id = convertJSXIdentifier(node.name),
        key = id.name;

      if (hasChildren && key === 'children') return

      if (t__namespace.isJSXExpressionContainer(value)) {

        if (key === 'ref') ; else if (
          isDynamic(attribute.get('value').get('expression'), {
            checkMember: true,
            checkTags: true
          })
        ) {


          let expr =
            config.wrapConditionals &&
            (t__namespace.isLogicalExpression(value.expression) ||
              t__namespace.isConditionalExpression(value.expression))
          ? transformCondition(attribute.get('value').get('expression'), true)
          : t__namespace.arrowFunctionExpression([], value.expression);

          runningObject.push(
            t__namespace.objectMethod(
              'get',
              id,
              [],
              t__namespace.blockStatement([t__namespace.returnStatement(expr.body)]),
              !t__namespace.isValidIdentifier(key)
          ));

        } else { runningObject.push(t__namespace.objectProperty(id, value.expression)); }
      }
    }


  });

  const childResult = transformComponentChildren(path.get('children'));
  if (childResult && childResult[0]) {
    if (childResult[1]) {

      const body =
        t__namespace.isCallExpression(childResult[0]) && t__namespace.isFunction(childResult[0].callee)
      ? childResult[0].callee.body
      : childResult[0].body;

      runningObject.push(
        t__namespace.objectMethod('get', 
          t__namespace.identifier('children'), 
          [], 
          t__namespace.isExpression(body) ? t__namespace.blockStatement([t__namespace.returnStatement(body)]): body
        ));
    }
  }

  if (runningObject.length || !props.length) props.push(t__namespace.objectExpression(runningObject));


  const componentArgs = [tagId, props[0]];
  exprs.push(t__namespace.callExpression(registerImportMethod(path, 'createComponent'), componentArgs));

  return { exprs, template: "", component: true }
}

function transformComponentChildren(children, config) {
  const createTemplate$1 = createTemplate,
  filteredChildren = filterChildren(children);

  if (!filteredChildren.length) return
  let dynamic = false;

  let transformedChildren = filteredChildren.reduce((memo, path) => {
    if (t__namespace.isJSXText(path.node)) ; else {
      const child = transformNode(path, {
        topLevel: true,
        componentChild: true
      });
      dynamic = dynamic || child.dynamic;
      memo.push(createTemplate$1(path, child, filteredChildren.length > 1));
    }
    return memo
  }, []);

  if (transformedChildren.length === 1) {
    transformedChildren = transformedChildren[0];

    if (!t__namespace.isJSXExpressionContainer(filteredChildren[0]) &&
      !t__namespace.isJSXSpreadChild(filterChildren[0]) &&
      !t__namespace.isJSXText(filterChildren[0])) {
      transformedChildren = 
        t__namespace.isCallExpression(transformedChildren) &&
        !transformedChildren.arguments.length &&
        !t__namespace.isIdentifier(transformedChildren.callee)
      ? transformedChildren.callee
      : t__namespace.arrowFunctionExpression([], transformedChildren);
      dynamic = true;
    }
  }

  return [transformedChildren, dynamic]
}

function convertJSXIdentifier(node) {
  if (t__namespace.isJSXIdentifier(node)) {
    if (t__namespace.isValidIdentifier(node.name)) {
      node.type = 'Identifier';
    } else {
      return t__namespace.stringLiteral(node.name)
    }
  } else if (t__namespace.isJSXMemberExpression(node)) {
    return t__namespace.memberExpression(
      convertJSXIdentifier(node.object),
      convertJSXIdentifier(node.property)
    )
  }
  return node
}

function transformFragmentChildren(children, results, config) {
  const createTemplate$1 = createTemplate,
    filteredChildren = filterChildren(children),
    childNodes = filteredChildren.reduce((memo, path) => {
      if (t__namespace.isJSXText(path.node)) ; else {
        const child = transformNode(path, { topLevel: true, fragmentChild: true });
        memo.push(createTemplate$1(path, child, true));
      }
      return memo
    }, []);
  results.exprs.push(childNodes.length === 1? childNodes[0]: t__namespace.arrayExpression(childNodes));
}

function transformJSX(path) {

  getConfig(path);
  const replace = transformThis(path);
  const result = transformNode(
    path,
    t__namespace.isJSXFragment(path.node)
    ? {}: { topLevel: true }
  );

  const template = createTemplate;

  path.replaceWith(replace(template(path, result, false)));
}


function transformThis(path) {
  let thisId;
  path.traverse({
    ThisExpression(path) {
      thisId || (thisId = path.scope.generateUidIdentifier("self$"));
      path.replaceWith(thisId);
    }
  });

  return node => {
    if (thisId) {
      let parent = path.getStatementParent();
      const decl = t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(thisId, t__namespace.thisExpression())
      ]);
      parent.insertBefore(decl);
    }
    return node
  }
}


function transformNode(path, info = {}) {
  const config = getConfig(path);
  const node = path.node;
  if (t__namespace.isJSXElement(node)) {
    let tagName = getTagName(node);
    if (isComponent(tagName)) return transformComponent(path)
    const element =
      transformElement;
    return element(path, info)
  } else if (t__namespace.isJSXFragment(node)) {
    let results = { template: '', decl: [], exprs: [], dynamics: [] };

    transformFragmentChildren(path.get('children'), results);
    return results
  } else if (t__namespace.isJSXExpressionContainer(node)) {
    if (t__namespace.isJSXEmptyExpression(node.expression)) return null
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
      (t__namespace.isLogicalExpression(node.expression) || t__namespace.isConditionalExpression(node.expression))
    ? transformCondition(path.get('expression'), info.componentChild)
    : !info.componentChild &&
      (info.fragmentChild) &&
      t__namespace.isCallExpression(node.expression.callee) &&
      node.expression.arguments.length === 0
    ? node.expression.callee : t__namespace.arrowFunctionExpression([], node.expression);

    return {
      exprs:
      expr.length > 1
      ? [
        t__namespace.callExpression(
          t__namespace.arrowFunctionExpression(
            t__namespace.blockStatement([expr[0], t__namespace.returnStatement(expr[1])])
          ),
          []
        )
      ] : [expr],
      template: '',
      dynamic: true
    }
  } else {
    console.log('none', node);
  }
}

var postprocess = path => {
  getConfig(path);


  if (path.scope.data.templates) {
    const appendTemplates$1 = appendTemplates;

    appendTemplates$1(path, path.scope.data.templates);
  }
};

var config = {
  moduleName: "sol",
  generate: "sol",
  wrapConditionals: true,
  requireImportSource: false,
  effectWrapper: 'effect',
  memoWrapper: 'memo'
};

var preprocess = (path, { opts }) => {
  const merged = path.hub.file.metadata.config = Object.assign({}, config, opts);

  merged.requireImportSource;
};

var index = () => {
  return {
    name: "JSX SOL Expressions",
    inherits: SyntaxJSX__default["default"],
    visitor: {
      JSXElement: transformJSX,
      JSXFragment: transformJSX,
      Program: {
        enter: preprocess,
        exit: postprocess
      }
    }
  }
};

module.exports = index;
