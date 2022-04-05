import { template as _$template } from "r-sol";
import { insert as _$insert } from "r-sol";
import { createComponent as _$createComponent } from "r-sol";

const _tmpl$ = /*#__PURE__*/ _$template(`<sprite></sprite>`, 2),
  _tmpl$2 = /*#__PURE__*/ _$template(`<module></module>`, 2);

const children = _tmpl$.clone;
const dynamic = {
  children,
};

const template = _$createComponent(Module, {
  children: children,
});

const template2 = (() => {
  const _el$2 = _tmpl$2.clone;

  _$insert(_el$2, children);

  return _el$2;
})();

const template3 = _tmpl$2.clone;

const template4 = (() => {
  const _el$4 = _tmpl$2.clone;

  _$insert(_el$4, _$createComponent(Hello, {}));

  return _el$4;
})();

const template20 = (() => {
  const _el$5 = _tmpl$2.clone;

  _$insert(_el$5, () => children());

  return _el$5;
})();

const template21 = _$createComponent(Module, {
  get children() {
    return children();
  },
});
