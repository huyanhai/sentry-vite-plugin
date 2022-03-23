import json from "@rollup/plugin-json";
import { babel } from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import ts from "rollup-plugin-typescript2";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
    ],
    plugins: [
      commonjs(),
      esbuild(),
      json(),
      babel(),
      // ts({
      //   clean: true,
      // }),
    ],
  },
];
