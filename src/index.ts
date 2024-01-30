import { ExporterService } from "./exporter/exporter.service";
import { ExportColorStyle, ExportColorStyleGradient, ExportColorStyleSolidBase, ExportColorStyleSolidVariable } from "./exporter/types/export-color-style.interface";
import { ExportEffectBlur, ExportEffectDropShadow, ExportEffectInnerShadow, ExportEffectStyle } from "./exporter/types/export-effect-style.interface";
import { ExportFontStyle } from "./exporter/types/export-font-style.interface";
import { ExportOptions } from "./exporter/types/export-options.interface";
import { ExportVariable } from "./exporter/types/export-variable.interface";

new class Plugin {
  private eventHandlers: Map<string, Function> = new Map();

  constructor() {
    console.clear();
    figma.showUI(__html__);
    figma.ui.resize(640, 450)

    figma.ui.onmessage = msg => {
      const handler = this.eventHandlers.get(msg.eventName);
      if (handler) handler(...msg.args);
    }
    
    this.eventHandlers.set("action::setHeight", this.onSetHeight.bind(this));
    this.eventHandlers.set("action::export", this.onExport.bind(this));
    this.eventHandlers.set("action::getModes", this.sendModesToWebView.bind(this));
    

    this.sendCollectionsToWebView();
  }

   sendCollectionsToWebView() {
    console.log({rem:  figma.currentPage})
    const collections = figma.variables.getLocalVariableCollections().map(e => { return { id: e.id, name: e.name } })
    figma.ui.postMessage({ type: "collections", collections: collections }, { origin: "*" })
  }
  sendModesToWebView(collectionId:string) {
    const modes = figma.variables.getLocalVariableCollections().filter((e)=> e.id==collectionId).map((e)=> e.modes)
    figma.ui.postMessage({ type: "modes", collections: modes }, { origin: "*" })
  }

  onSetHeight(height: number) {
    figma.ui.resize(420, height);
  }
  

  onExport(options: ExportOptions) {
    console.log(options)
    const variables = this.getExportVariables();
    const fontStyles = this.getExportFontStyles();
    const effectStyles = this.getExportEffectStyles();
    const colorStyles = this.getExportColorStyles();

    const exporterService = new ExporterService(variables, fontStyles, effectStyles, colorStyles, options);
    exporterService.runPipeline();
    figma.ui.postMessage({ type: "ui::save_message", files: exporterService.getFiles().map(file => [file.path, file.getFileContent()]) }, { origin: "*" })
  }

  public getExportColorStyles() {
    return figma.getLocalPaintStyles().map(style => ({
      name: style.name,
      layers: style.paints.filter(p => p.type != "VIDEO" && p.type != "IMAGE").map(p => {
        if (p.type == "SOLID") {
          if (p.boundVariables?.color) {
            const variable = figma.variables.getVariableById(p.boundVariables.color.id) as Variable

            return {
              type: p.type,
              valueType: "VARIABLE",
              variable: this.convertVariable(variable),
              visible: p.visible
            } as ExportColorStyleSolidVariable
          } else {
            return {
              type: p.type,
              valueType: 'COLOR',
              value: { r: p.color.r, g: p.color.g, b: p.color.b, a: p.opacity || 1 },
              visible: p.visible
            } as ExportColorStyleSolidBase
          }
        }

        p = p as GradientPaint

        return {
          type: p.type,
          gradientTransform: p.gradientTransform,
          gradientStops: p.gradientStops,
          visible: p.visible,
          opacity: p.opacity || 1
        } as ExportColorStyleGradient
      })
    } as ExportColorStyle))
  }

  public getExportEffectStyles(): Array<ExportEffectStyle> {
    return figma.getLocalEffectStyles().map(style => ({
      name: style.name,
      effects: style.effects.map(effect => {
        if (effect.type == "DROP_SHADOW") {
          return {
            type: effect.type,
            color: effect.color,
            offset: effect.offset,
            radius: effect.radius,
            spread: effect.spread,
            visible: effect.visible,
          } as ExportEffectDropShadow
        } else if (effect.type == "INNER_SHADOW") {
          return {
            type: effect.type,
            color: effect.color,
            offset: effect.offset,
            radius: effect.radius,
            spread: effect.spread,
            visible: effect.visible,
          } as ExportEffectInnerShadow
        }

        return {
          type: effect.type,
          radius: effect.radius,
          visible: effect.visible
        } as ExportEffectBlur
      })
    } as ExportEffectStyle))
  }

  public getExportFontStyles(): Array<ExportFontStyle> {
    return figma.getLocalTextStyles().map(style => {
      return {
        name: style.name,
        fontSize: style.fontSize,
        fontWeight: (() => {
          try {
            const text = figma.createText()
            text.textStyleId = style.id;
            const result = text.fontWeight;
            text.remove()
  
            return result
          } catch {
            return 400;
          }
        })(),
        fontName: {
          family: style.fontName.family,
        },
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight
      } as ExportFontStyle
    })
  }

  public getExportVariables(): Record<string, ExportVariable> {
    const entries = figma.variables.getLocalVariables()
      .filter(variable => variable.resolvedType == "FLOAT" || variable.resolvedType == "COLOR")
      .map(
        variable => {
          const obj = this.convertVariable(variable);

          return [obj.id, obj]
        }
      )

    return Object.fromEntries(entries);
  }

  private convertVariable(variable: Variable): ExportVariable {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId) as VariableCollection;

    const valuesByModes = Object.keys(variable.valuesByMode).map(key => ({ mode: collection.modes.filter(mode => mode.modeId == key)[0].name, value: variable.valuesByMode[key] }))

    const obj: ExportVariable = {
      id: variable.id,
      name: variable.name,
      resolvedType: variable.resolvedType as "COLOR" | "FLOAT",
      valuesByMode: valuesByModes,
      collection: {
        id: collection.id,
        name: collection.name,
      }
    }

    return obj
  }
}