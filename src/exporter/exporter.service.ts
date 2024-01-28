// @ts-ignore
import path from "../path";
import { ExportOptions } from "./types/export-options.interface";
import { ExportVariable } from "./types/export-variable.interface";
import { FormattedVariableValue } from "./types/formatted-variable-value.type";
import { RGBA } from "./types/rgba.interface";
import { ExportFontStyle } from "./types/export-font-style.interface";
import { FileStyle } from "../file/file-style";
import { FileStyleScss } from "../file/file-style-scss";
import { ExportEffectStyle } from "./types/export-effect-style.interface";
import { ExportColorStyle } from "./types/export-color-style.interface";
import { FileColorStyle } from "../file/types/file-color-style.interface";
import { rgbaToHex, unboundRGBA } from "../utils";

export class ExporterService {
  private readonly variables: Record<string, ExportVariable>;
  private readonly fontStyles: Array<ExportFontStyle>;
  private readonly effectStyles: Array<ExportEffectStyle>;
  private readonly colorStyles: Array<ExportColorStyle>;
  private readonly options: ExportOptions;
  private readonly files: Record<string, FileStyle>;
  
  private readonly FileClass: typeof FileStyle;
  
  constructor(variables: Record<string, ExportVariable>, fontStyles: Array<ExportFontStyle>, effectStyles: Array<ExportEffectStyle>, colorStyles: Array<ExportColorStyle>, options: ExportOptions) {
    this.files = {};
    this.variables = variables;
    this.fontStyles = fontStyles;
    this.effectStyles = effectStyles;
    this.colorStyles = colorStyles;
    this.options = options;

    this.FileClass = options.lang == "SCSS" ? FileStyleScss : FileStyle;
  }

  public getFiles() {
    console.log(this.files)
    return Object.values(this.files);
  }

  public runPipeline() {
    this.createVariableContent();

    if (this.options.exportTextStyles) {
      this.createFontStylesContent();
    }

    if (this.options.exportEffectStyles) {
      this.createEffectStylesContent();
    }

    if (this.options.exportColorStyles) {
      this.createColorStylesContent();
    }
  }

  public createVariableContent() {
    for (const variable of Object.values(this.variables)) {
      if (this.options.collection != "ALL") {
        if (this.options.collection != variable.collection.id) {
          continue;
        }
      }

      for (const variableValue of variable.valuesByMode) {
        const { directory, filename } = this.getPathFromName(variable.name, "variables", variable.collection.name || "", variableValue.mode || "");
        const file = this.getFileByPath(directory, filename, this.options);
        let formattedName = this.getFormattedName(variable.name || "");
        const formattedValue = this.getFormattedVariableValue(variable, variableValue);

        if (!this.options.sort) {
          formattedName += "-" + this.getFormattedName(variableValue.mode)
        }

        if (formattedValue.type == "ALIAS") {
          // const aliasPath = this.getPathFromName(formattedValue.value.name, "variables", formattedValue.value.collection.name, variableValue.mode);

          // if (this.options.sort) {
          //   const aliasFile = this.getFileByPath(aliasPath.directory, aliasPath.filename, this.options);
          //   file.addImport(aliasFile);
          // }

          const formattedAliasName = this.getFormattedName(formattedValue.value.name || "");
          file.addAlias({ from: formattedName, to: formattedAliasName });
        } else {
          file.addVariable({ name: formattedName, value: formattedValue });
        }
      }
    }
  }

  private createFontStylesContent() {
    for (const fontStyle of this.fontStyles) {
      const { directory, filename } = this.getPathFromName(fontStyle.name, "styles", "texts");

      const file = this.getFileByPath(directory, filename, this.options);

      fontStyle.name = this.getFormattedName(fontStyle.name);

      file.addFontStyle(fontStyle);
    }
  }

  private createEffectStylesContent() {
    for (const effectStyle of this.effectStyles) {
      const { directory, filename } = this.getPathFromName(effectStyle.name, "styles", "effects");

      const file = this.getFileByPath(directory, filename, this.options);

      effectStyle.name = this.getFormattedName(effectStyle.name);

      file.addEffectStyle(effectStyle);
    }
  }

  private createColorStylesContent() {
    for (const style of this.colorStyles) {
      const name = this.getFormattedName(style.name);

      const colorStyle: FileColorStyle = {
        name,
        layers: []
      }

      for (const layer of style.layers) {
        if (layer.type == "SOLID") {
          if (layer.valueType == "VARIABLE") {

            colorStyle.layers.push({
              type: "VARIABLE",
              name: this.getFormattedName(layer.variable.name)
            })

            for (const { mode } of layer.variable.valuesByMode) {
              const { directory, filename } = this.getPathFromName(style.name, "styles", "colors", mode)

              const file = this.getFileByPath(directory, filename, this.options)

              file.addColorStyle(colorStyle)

              const aliasPath = this.getPathFromName(layer.variable.name, "variables", layer.variable.collection.name, mode)
              const aliasFile = this.getFileByPath(aliasPath.directory, aliasPath.filename, this.options)
  
              file.addImport(aliasFile)
            }
          } else {
            colorStyle.layers.push(layer);
          }
        } else {
          colorStyle.layers.push(layer);
        }
      }

      if (colorStyle.layers.filter(s => s.type == "VARIABLE").length == 0) {
        const { directory, filename } = this.getPathFromName(style.name, "styles", "colors");
        const file = this.getFileByPath(directory, filename, this.options)
        colorStyle.name = this.getFormattedName(colorStyle.name);
        file.addColorStyle(colorStyle)
      }
    }
  }

  private getFormattedName(name: string) {
    return name.replace(/\//g, "-").replace(/\s+/g, "-").toLowerCase();
  }

  private getFormattedVariableValue(variable: ExportVariable, variableValue: { mode: string, value: VariableValue }): FormattedVariableValue {
    if ((variableValue.value as VariableAlias).type == "VARIABLE_ALIAS") {
      const alias = this.variables[(variableValue.value as VariableAlias).id];

      return { type: "ALIAS", value: alias }
    }

    if (variable.resolvedType == "COLOR") {
      if (this.options.color == "HEX") {
        const value = unboundRGBA((variableValue.value as RGBA).r, (variableValue.value as RGBA).g, (variableValue.value as RGBA).b, (variableValue.value as RGBA).a)

        return {
          type: "HEX",
          value: rgbaToHex(value)
        }
      } else if ((variableValue.value as RGBA).a) {
        const value = variableValue.value as RGBA;

        return { 
          type: "RGBA", 
          value: unboundRGBA(value.r, value.g, value.b, value.a)
        }
      } else {
        const value = variableValue.value as RGB;

        return {
          type: "RGB",
          value: unboundRGBA(value.r, value.g, value.b, 1) as RGB
        }
      }
    }

    // variable.resolverType == "FLOAT"
    return { type: "PIXELS", value: Math.round(Number(variableValue.value) * 100) / 100 }
  }

  private getPathFromName(name: string, ...prefixes: string[]) {
    if (!this.options.sort) {
      return { directory: "", filename: "index" };
    }

    const tokens = [
      ...name.split("/")
    ].slice(0, -1)

    return {
      filename: tokens.length > 0 ? tokens.pop() as string : "index",
      directory: path.join(...prefixes, ...tokens)
    }
  }

  private getFileByPath(directory: string, filename: string, options: ExportOptions) {
    const pth = path.join(directory, filename);
    if (!this.files[pth]) {
      this.files[pth] = new this.FileClass(directory, filename, options);
    }

    return this.files[pth];
  }
}