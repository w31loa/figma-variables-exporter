import { FileStyle } from "./file-style";

export class FileStyleScss extends FileStyle {
  protected override variableEnd = "\n\n";
  protected override variableStart = "";
  protected override variableTab = "\n";

  public getExtension(): string {
    return "scss";
  }

  protected getFormattedVariableAssigning(assigning: string) {
    return `$${assigning}`
  }

  protected getFormattedVariableAssignable(assignable: string) {
    return `$${assignable}`
  }
}