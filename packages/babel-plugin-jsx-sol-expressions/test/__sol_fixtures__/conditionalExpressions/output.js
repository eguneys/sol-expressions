import { createComponent as _$createComponent } from "r-sol";
import { memo as _$memo } from "r-sol";

const template12 = _$createComponent(Comp, {
  get render() {
    return _$memo(() => !!state.dynamic, true)() ? good() : bad;
  },
});

const template13 = _$createComponent(Comp, {
  get render() {
    return state.dynamic ? good : bad;
  },
});

const template16 = _$createComponent(Comp, {
  get render() {
    return state.dynamic || good();
  },
});

const template17 = _$createComponent(Comp, {
  get render() {
    return _$memo(() => !!state.dynamic, true)()
      ? _$createComponent(Comp, {})
      : _$createComponent(Comp, {});
  },
});

const template18 = _$createComponent(Comp, {
  get children() {
    return _$memo(() => !!state.dynamic, true)()
      ? _$createComponent(Comp, {})
      : _$createComponent(Comp, {});
  },
});
