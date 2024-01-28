import { ExportVariable } from "./export-variable.interface"
import { RGBA } from "./rgba.interface"

export interface ExportColorStyleSolidBase {
  type: 'SOLID',
  valueType: 'COLOR'
  value: RGBA
  visible?: boolean
}

export interface ExportColorStyleSolidVariable {
  type: 'SOLID'
  valueType: 'VARIABLE'
  variable: ExportVariable
  visible?: boolean
}

export interface ExportColorStyleGradient {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'
  gradientTransform: [[number, number, number], [number, number, number]]
  gradientStops: ReadonlyArray<{
    position: number
    color: RGBA
  }>
  visible?: boolean
  opacity?: number
}


export interface ExportColorStyle {
  name: string
  layers: Array<ExportColorStyleSolidBase | ExportColorStyleSolidVariable | ExportColorStyleGradient>
}