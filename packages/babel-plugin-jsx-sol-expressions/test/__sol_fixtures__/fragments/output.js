import { template as _$template } from "r-sol";
import { insert as _$insert } from "r-sol";
import { createComponent as _$createComponent } from "r-sol";

const _tmpl$ = /*#__PURE__*/ _$template(`<transform></transform>`, 2);

const firstComponent = [
  _$createComponent(Component, {}),
  _$createComponent(Component2, {}),
];
const twoComponent = [
  _$createComponent(Component, {}),
  _$createComponent(Component, {}),
];

const three = (() => {
  const _el$ = _tmpl$.clone;

  _$insert(_el$, [
    _$createComponent(Comp, {}),
    _$createComponent(For, {
      each: lakjdsf,
      children: (_) => _$createComponent(Comp, {}),
    }),
    _$createComponent(Comp, {}),
  ]);

  return _el$;
})();
