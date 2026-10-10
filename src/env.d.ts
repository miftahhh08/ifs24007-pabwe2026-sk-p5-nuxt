/// <reference types="vite/client" />

// Konstanta global yang disuntikkan lewat `define` (nuxt.config.ts & vite.config.ts)
declare const DELCOM_BASEURL: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}
