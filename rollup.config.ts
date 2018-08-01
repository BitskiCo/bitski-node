import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const globals = { 'simple-oauth2': 'OAuth2'  };

export default {
  external: Object.keys(pkg.dependencies),
  input: 'src/bitski-provider.ts',
  output: [
    { file: pkg.main, name: pkg.name, format: 'umd', sourcemap: true, globals },
    { file: pkg.module, format: 'es', sourcemap: true, globals },
  ],
  plugins: [

    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true, tsconfigOverride: { compilerOptions: { target: 'es5' } } }),

    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),

    // Resolve source maps to the original source
    sourceMaps()
  ],
  watch: {
    include: 'src/**',
  },
};
