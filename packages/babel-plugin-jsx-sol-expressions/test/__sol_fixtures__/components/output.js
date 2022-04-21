import { template as _$template } from "r-sol";
import { insert as _$insert } from "r-sol";
import { createComponent as _$createComponent } from "r-sol";

const _tmpl$ = /*#__PURE__*/ _$template(`<transform></transform>`, 2),
  _tmpl$2 = /*#__PURE__*/ _$template(
    `<transform><transform></transform></transform>`,
    4
  );

let t_;

const templateR = (() => {
  const _el$ = _tmpl$.clone;
  const _ref$ = t_;
  typeof _ref$ === "function" ? _ref$(_el$) : (t_ = _el$);
  return _el$;
})();

const template3 = _$createComponent(Child, {
  get children() {
    return [_tmpl$.clone, _tmpl$.clone, _tmpl$.clone];
  },
});

const template6 = _$createComponent(For, {
  get each() {
    return state.list;
  },

  get fallback() {
    return _$createComponent(Loading, {});
  },

  children: (item) =>
    _$createComponent(Show, {
      get when() {
        return state.condition;
      },

      children: item,
    }),
});

const _self$ = this;

const template13 = _$createComponent(Component, {
  get prop() {
    return _self$.something;
  },

  get children() {
    return _$createComponent(Nested, {
      get propd() {
        return _self$.data;
      },
    });
  },
});

const template60 = (() => {
  const _el$5 = _tmpl$.clone;

  _$insert(_el$5, _$createComponent(Tile, {}), null);

  _$insert(
    _el$5,
    _$createComponent(For, {
      each: list,
      children: ([no, box]) => _$createComponent(Tile, {}),
    }),
    null
  );

  _$insert(_el$5, () => props.children, null);

  return _el$5;
})();

const template61 = (() => {
  const _el$6 = _tmpl$2.clone;

  _$insert(
    _el$6,
    _$createComponent(For, {
      each: list,
      children: (_) => _tmpl$.clone,
    }),
    null
  );

  return _el$6;
})();
