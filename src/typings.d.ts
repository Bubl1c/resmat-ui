// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

interface IAppConfig {
  productionHostname: string
  title: string
  topBarHeader: string,
  icon: string //"../img/favicon.ico"
  consent: string
}

interface IAPIConfig {
  host: string
  port: number
  version: string
}

interface IResmatConfig {
  env: "local" | "knuca" | "zmi"
  app: IAppConfig
  api: IAPIConfig
  googleAnalytics: {
    trackingId: string
  }
}

declare var ResmatConfig: IResmatConfig;
