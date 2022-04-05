import { createComponent as _$createComponent } from "r-sol";

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
