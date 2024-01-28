import { RGBA } from "./rgba.interface"

export interface ExportEffectDropShadow {
  type: 'DROP_SHADOW'
  color: RGBA
  offset: { x: number, y: number }
  radius: number
  spread?: number
  visible: boolean
}

export interface ExportEffectInnerShadow {
  type: 'INNER_SHADOW'
  color: RGBA
  offset: { x: number, y: number }
  radius: number
  spread?: number
  visible: boolean
}

export interface ExportEffectBlur {
  type: 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  radius: number
  visible: boolean
}

export interface ExportEffectStyle {
  name: string
  effects: Array<ExportEffectBlur | ExportEffectDropShadow | ExportEffectInnerShadow>
}