// The React 18 UMD build has no jsx-runtime; map the automatic JSX runtime onto createElement.
const R = window.React;
export function jsx(type, props, key) {
  return R.createElement(type, key === undefined ? props : { ...props, key });
}
export const jsxs = jsx;
export const Fragment = R.Fragment;
