import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'ReactPannable',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  external: ['react', 'react-dom'],
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    commonjs(),
    env === 'production' &&
      uglify({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
  ].filter(Boolean),
};
