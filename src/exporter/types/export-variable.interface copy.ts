import { ExportCollection } from "./export-collection.interface"

export interface ExportVariable {
  id: string
  name: string
  collection: ExportCollection
  resolvedType: "FLOAT" | "COLOR"
  valuesByMode: Array<{mode: string, value: VariableValue}>
}