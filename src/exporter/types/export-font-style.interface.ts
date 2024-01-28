export interface ExportFontStyle {
  name: string
  fontSize: number
  fontWeight: number
  fontName: {
    family: string
  }
  letterSpacing: {
    value: number
    unit: "PIXELS" | "PERCENT"
  }
  lineHeight: {
    value: number
    unit: 'PIXELS' | 'PERCENT'
  } | {
    unit: 'AUTO'
  }
}