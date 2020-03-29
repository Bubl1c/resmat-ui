export namespace GGB {

  export enum LabelMode {
    Name,
    NameValue,
    Value,
    Caption,
    CaptionValue
  }

  export interface Applet {
    inject(id: string): void
  }

  // API: https://wiki.geogebra.org/en/Reference:GeoGebra_Apps_API
  // Commands: https://wiki.geogebra.org/en/Scripting_Commands
  export interface API {
    setGridVisible(value: boolean): void
    setAxesVisible(x: boolean, y: boolean): void
    evalCommand(command: string): void
    newConstruction(): void
    deleteObject(objName: string): void
  }

  //https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
  export interface AppletProperties {
    appName?: string, //"classic", "geometry"
    width?: number
    height?: number
    showToolBar?: boolean
    borderColor?: any
    showMenuBar?: boolean
    allowStyleBar?: boolean
    showAlgebraInput?: boolean
    customToolbar?: string
    enableLabelDrags?: boolean
    enableShiftDragZoom?: boolean
    enableRightClick?: boolean
    capturingThreshold?: any
    showToolBarHelp?: boolean
    errorDialogsActive?: boolean
    showTutorialLink?: boolean
    showLogging?: boolean
    useBrowserForJS?: boolean
    rounding?: string //"s" - significant digits, "d" - decimal places (default). Example: "10s", "5"
    language?: string
    country?: string
    perspective?: string //"G", "AG"
    appletOnLoad?: (api: GGB.API) => void
  }

}
