const cjs =
  process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'commonjs';
const loose = true;

module.exports = {
  presets: [['@babel/env', { loose, modules: false }], '@babel/react'],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose }],
    cjs && ['@babel/transform-modules-commonjs', { loose }],
    ['@babel/transform-runtime', { useESModules: !cjs }],
  ].filter(Boolean),
};
