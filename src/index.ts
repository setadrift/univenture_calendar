{
  "extends": "@finsweet/tsconfig",
  "compilerOptions": {
    "rootDir": ".",
    "baseUrl": "./",
    "paths": {
      "$utils/*": ["src/utils/*"]
    },
    "types": ["@finsweet/ts-utils"],
    "outDir": "dist"
  }
}
