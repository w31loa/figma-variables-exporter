export interface ExportOptions {
  lang: "CSS" | "SCSS";
  sort?: string;
  collection: "ALL" | string;
  color: "RGBA" | "HEX";
  exportTextStyles?: string
  exportEffectStyles?: string
  exportColorStyles?: string
}