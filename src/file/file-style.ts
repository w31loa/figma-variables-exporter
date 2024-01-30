// @ts-ignore
import path from "../path";
import { ExportFontStyle } from "../exporter/types/export-font-style.interface";
import { FileAlias } from "./types/file-alias.interface";
import { FileVariable } from "./types/file-variable.interface";
import { ExportEffectDropShadow, ExportEffectInnerShadow, ExportEffectStyle } from "../exporter/types/export-effect-style.interface";
import { FileColorStyle } from "./types/file-color-style.interface";
import { pxToRem, rgbaToHex, unboundRGBA } from "../utils";
import { ExportOptions } from "../exporter/types/export-options.interface";

export class FileStyle {
  protected readonly imports: Set<string> = new Set();
  protected readonly aliases: FileAlias[] = [];
  protected readonly variables: FileVariable[] = [];
  protected readonly fontStyles: ExportFontStyle[] = [];
  protected readonly colorStyles: FileColorStyle[] = [];
  protected readonly effectStyles: ExportEffectStyle[] = [];
  protected readonly options: ExportOptions;

  public readonly directory: string;
  public readonly filename: string;
  public readonly path: string;

  protected variableEnd = "\n}\n\n";
  protected variableTab = "\n  ";
  protected variableStart = "\n :root {";

  constructor(directory: string, filename: string, options: ExportOptions) {
    this.options = options;
    this.directory = directory;
    this.filename = filename;
    this.path = path.join(this.directory, this.filename + "." + this.getExtension());
  }

  public getExtension() {
    return "css";
  }
  public getFileContent() {
    return this.getImportsContent() + this.getVariablesContent() + this.getAliasesContent() + this.getColorStyelsContent() + this.getFontStylesContent() + this.getEffectStylesContent();
  }

  public addImport(file: FileStyle) {

    const importPath = path.join(path.relative(this.directory, file.directory), file.filename  + "." + file.getExtension());

    if (importPath.length > 0) {
      this.imports.add(importPath);
    }
  }

  public addFontStyle(fontStyle: ExportFontStyle) {
    this.fontStyles.push(fontStyle);
  }

  public addVariable(variable: FileVariable) {
    this.variables.push(variable);
  }

  public addAlias(alias: FileAlias) {
    this.aliases.push(alias);
  }

  public addEffectStyle(effectStyle: ExportEffectStyle) {
    this.effectStyles.push(effectStyle);
  }

  public addColorStyle(colorStyle: FileColorStyle) {
    this.colorStyles.push(colorStyle);
  }

  protected getColorStyelsContent() {
    if (this.colorStyles.length > 0) {
      let content = "/* Color Styles  */" + this.variableStart;

      for (const colorStyle of this.colorStyles) {

        content += `${this.variableTab}${this.getFormattedVariableAssigning(colorStyle.name)}: `

        colorStyle.layers = colorStyle.layers.sort(l => (l.type == "VARIABLE" ? 1 : 0 ))

        for (let i = 0; i < colorStyle.layers.length; i++) {
          const layer = colorStyle.layers[i]
        
          if (layer.type == "SOLID") {
            const rgba = unboundRGBA(layer.value.r, layer.value.g, layer.value.b, layer.value.a);

            if (this.options.color == "RGBA") {
              content +=`rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
            } else {
              content += rgbaToHex(rgba)
            }
          } else if (layer.type == "VARIABLE") {
            content += this.getFormattedVariableAssignable(layer.name)
          } else {
            switch (layer.type) {
              case "GRADIENT_ANGULAR": {
                content +=`conic-gradient(from 180deg at 50% 50%, `
                break
              }
              case "GRADIENT_RADIAL": {
                content +=`radial-gradient(50% 50% at 50% 50%, `
                break
              }
              case "GRADIENT_LINEAR": default: {
                content +=`linear-gradient(90deg, `
                break
              }
            }

            for (let j = 0; j < layer.gradientStops.length; j++) {
              const stop = layer.gradientStops[j]
              const rgba = unboundRGBA(stop.color.r, stop.color.g, stop.color.b, stop.color.a)

              content += `${stop.position * 100}% rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`

              if (j < layer.gradientStops.length - 1) {
                content += ", "
              }
            }

            content += ')'
          }

          if (i < colorStyle.layers.length - 1) {
            content += ", "
          }
        }

        content += ";"
      }

      content += this.variableEnd;

      return content
    }

    return ""
  }
// и тут
  protected getEffectStylesContent() {
    if (this.effectStyles.length > 0) {
      let content = "/* Effect Styles  */\n"

      for (const style of this.effectStyles) {
        content += `.${style.name} {\n`

        const shadowEffects = style.effects.filter(e => e.type == "DROP_SHADOW" || e.type == "INNER_SHADOW") as (ExportEffectDropShadow | ExportEffectInnerShadow)[]

        if (shadowEffects.length > 0) {
          content += "  box-shadow:"

          for (let i = 0; i < shadowEffects.length; i++) {
            const effect = shadowEffects[i]
            const effectColor = unboundRGBA(effect.color.r, effect.color.g, effect.color.b, effect.color.a);
            //тут адовая гадость))
            if(this.options.units!='REM'){

              content += ` ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread || 0}px rgba(${effectColor.r}, ${effectColor.g}, ${effectColor.b}, ${effectColor.a})`

            }else if(this.options.remValue){

              content += ` ${pxToRem(+effect.offset.x, +this.options.remValue)}rem ${pxToRem(+effect.offset.y, +this.options.remValue)}rem ${pxToRem(+effect.radius, +this.options.remValue)}rem ${effect.spread?pxToRem(+effect.spread, +this.options.remValue): 0}rem rgba(${effectColor.r}, ${effectColor.g}, ${effectColor.b}, ${effectColor.a})`
             
            }

            if (effect.type == "INNER_SHADOW") {
              content += " inset"
            }

            if (i != shadowEffects.length - 1) {
              content += ","
            }
          }

          content += ";\n"
        }

        for (const effect of style.effects) {
          if (effect.visible) {
            if (effect.type == "LAYER_BLUR") {
              if(this.options.units!='REM'){
                content += `  filter: blur(${effect.radius}px);\n`
              }else if(this.options.remValue){
                content += `  filter: blur(${pxToRem(+effect.radius, +this.options.remValue)}rem);\n`
              }
            } else if (effect.type == "BACKGROUND_BLUR") {
              content += `  backdrop-filter: blur(${effect.radius}px);\n`
            }
          }
        }

        content += "}\n\n"
      }

      return content
    }

    return ""
  }
  // тут тоже пиксели
  protected getFontStylesContent() {
    if (this.fontStyles.length > 0) {
      let content = "/* Text Styles  */\n"

      
      for (const style of this.fontStyles) {
        content += `.${style.name} {\n`
        content += `  font-family: ${style.fontName.family};\n`


       
        if(this.options.units!='REM'){
          content += `  font-size: ${style.fontSize}px;\n`
          content += `  line-height: ${style.lineHeight.unit == "PIXELS" ? `${style.lineHeight.value}px` : style.lineHeight.unit == "PERCENT" ? `${Math.round(style.lineHeight.value * 100) / 100}%` : "normal"};\n`
          content += `  letter-spacing: ${style.letterSpacing.value}${style.letterSpacing.unit == "PERCENT" ? "%" : "px"};\n`

        }else if(this.options.remValue){
          content += `  filter: blur(${pxToRem(+style.fontSize, +this.options.remValue)}rem);\n`
          content += `  line-height: ${style.lineHeight.unit == "PIXELS" ? `${pxToRem(+style.lineHeight.value, +this.options.remValue)}rem` : style.lineHeight.unit == "PERCENT" ? `${Math.round(style.lineHeight.value * 100) / 100}%` : "normal"};\n`
          content += `  letter-spacing: ${pxToRem(+style.letterSpacing.value, +this.options.remValue)}${style.letterSpacing.unit == "PERCENT" ? "%" : "px"};\n`


        }


        content += `  font-weight: ${style.fontWeight};\n`

    






        content += "}\n\n";
      }

      return content;
    }

    return ""
  }

  protected getImportsContent() {
    if (this.imports.size > 0) {
      let content = "";

      for (const importPath of this.imports) {
        content += `@import "${importPath}";\n`
      }

      content += "\n";

      return content;
    }

    return "";
  }

  protected getAliasesContent() {
    if (this.aliases.length > 0) {
      let content = " /* Aliases  */" + this.variableStart;

      for (const alias of this.aliases) {
        content += `${this.variableTab}${this.getFormattedVariableAssigning(alias.from)}: ${this.getFormattedVariableAssignable(alias.to)};`
      }

      return content += this.variableEnd
    }

    return "";
  }
//тут добавить проверку опций и если есть передавать в ремамах то просто концертировать пиксили в ремы 1111)))
protected getVariablesContent() {
    if (this.variables.length > 0) {
      let content = " /* Variables  */" + this.variableStart;

      for (const variable of this.variables) {
        if (variable.value.type == "HEX") {
          content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${variable.value.value};`
        } else if (variable.value.type == "RGB") {
          content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: rgb(${variable.value.value.r}, ${variable.value.value.g}, ${variable.value.value.b});`
        } else if (variable.value.type == "RGBA") {
          content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: rgba(${variable.value.value.r}, ${variable.value.value.g}, ${variable.value.value.b}, ${variable.value.value.a});`
        } else {
          //вот где обычные перменные
          if(this.options.units!='REM'){
            content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${variable.value.value}px;`
          }else if(this.options.remValue){
            content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${ pxToRem(+variable.value.value, +this.options.remValue) }rem;`
          }
            
        }
      }

      return content += this.variableEnd;
    }

    return "";
  }

  protected getFormattedVariableAssigning(assigning: string) {
    return `--${assigning}`
  }

  protected getFormattedVariableAssignable(assignable: string) {
    return `var(--${assignable})`
  }
}