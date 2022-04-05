import { template as _$template } from "r-sol";
import { setAttribute as _$setAttribute } from "r-sol";

const _tmpl$ = /*#__PURE__*/ _$template(`<my-element></my-element>`, 2);

const template = (() => {
  const _el$ = _tmpl$.clone;

  _$setAttribute(_el$, "some-attr", name);

  _$setAttribute(_el$, "notProp", data);

  return _el$;
})();
