import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const inputFile = {
  index: 'es/index.js',
};

export default [
  // UMD Development
  {
    input: inputFile,
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'umd',
      name: 'ReactPannable',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    external: ['react', 'react-dom'],
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  },
  // UMD Production
  {
    input: inputFile,
    output: {
      dir: 'dist',
      entryFileNames: '[name].min.js',
      format: 'umd',
      name: 'ReactPannable',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    external: ['react', 'react-dom'],
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
