import { template as _$template } from "r-sol";
import { setAttribute as _$setAttribute } from "r-sol";
import { effect as _$effect } from "r-sol";

const _tmpl$ = /*#__PURE__*/ _$template(`<transform></transform>`, 2);

const template = (() => {
  const _el$ = _tmpl$.clone;

  _$effect(() => _$setAttribute(_el$, "title", welcoming()));

  return _el$;
})();

const template2 = (() => {
  const _el$2 = _tmpl$.clone;

  _$effect(() => _$setAttribute(_el$2, "translate", Vec2.unit));

  return _el$2;
})();
