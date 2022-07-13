import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'Gamerig.Threejs',
      file: 'dist/browser/gamerig.threejs.min.js',
      format: 'umd',
      sourcemap: !production,
      globals: {
        three: 'THREE',
      },
    },
    external: ['three'],
    plugins: [
      del({
        targets: ['./dist'],
        runOnce: !production,
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dts',
      }),
      production &&
        terser({
          format: {
            comments: false,
          },
        }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/index.ts',
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: !production },
      { file: pkg.module, format: 'es', sourcemap: !production },
    ],
    external: ['three'],
  },
  // bundle all type definitions into one file
  {
    input: 'dist/browser/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts(),
      del({
        targets: ['./dist/browser/dts'],
        hook: 'buildEnd',
      }),
    ],
  },
];
