export interface ExportOptions {
  lang: "CSS" | "SCSS";
  sort?: string;
  postfix?: string
  collection: "ALL" | string;
  mode: "ALL" | string
  color: "RGBA" | "HEX";
  units: "PX"| "REM"
  remValue?: string,
  exportTextStyles?: string
  exportEffectStyles?: string
  exportColorStyles?: string
}