/// <reference types="vite/client" />

declare module "*.css";

declare module "*.geojson" {
  const value: any;
  export default value;
}