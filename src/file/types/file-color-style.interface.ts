import { ExportColorStyleGradient, ExportColorStyleSolidBase } from "../../exporter/types/export-color-style.interface"

export interface FileColorStyleVariable {
  type: "VARIABLE"
  name: string
}

export interface FileColorStyle {
  name: string
  layers: Array<ExportColorStyleGradient | ExportColorStyleSolidBase | FileColorStyleVariable>
}