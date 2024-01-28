import { ExportVariable } from "./export-variable.interface"
import { RGB } from "./rgb.interface"
import { RGBA } from "./rgba.interface"

interface FormattedVariableValuePixels {
  type: "PIXELS"
  value: number
}

interface FormattedVariableValueRgb {
  type: "RGB"
  value: RGB
}

interface FormattedVariableValueRgba {
  type: "RGBA",
  value: RGBA
}

interface FormattedVariableValueHex {
  type: "HEX",
  value: string
}

interface FormattedVariableValueAlias {
  type: "ALIAS",
  value: ExportVariable
}

export type FormattedVariableValue = FormattedVariableValuePixels
  | FormattedVariableValueRgb
  | FormattedVariableValueRgba
  | FormattedVariableValueAlias
  | FormattedVariableValueHex