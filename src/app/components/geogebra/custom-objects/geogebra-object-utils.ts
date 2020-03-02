import { ColorUtils } from "../../../utils/color-utils";
import { GGB } from "../geogebra-definitions";
import { GeogebraObjectSettings } from "./geogebra-object";

export class GeogebraObjectUtils {

  private static currentId: number = 0;

  static nextId(): number {
    return GeogebraObjectUtils.currentId++;
  }

  static settingsWithDefaults(settings?: GeogebraObjectSettings): GeogebraObjectSettings {
    const ds = {
      opacityPercents: 70,
      color: undefined
    };
    const blackColor = "#000000";
    return {
      isVisible: settings && settings.isVisible || true,
      isLabelVisible: settings && settings.isLabelVisible || false,
      labelMode: settings && settings.labelMode ||
        settings && settings.caption && GGB.LabelMode.Caption ||
        GGB.LabelMode.Name,
      caption: settings && settings.caption || "",
      isFixed: settings && settings.isFixed || true,
      styles: settings && {
        opacityPercents: settings.styles && settings.styles.opacityPercents || ds.opacityPercents,
        color: settings.styles && settings.styles.color
      } || ds,
      outerPoints: {
        isVisible: settings && settings.outerPoints && settings.outerPoints.isVisible || false,
        isLabelsVisible: settings && settings.outerPoints && settings.outerPoints.isLabelsVisible || false,
        labelMode: settings && settings.outerPoints && settings.outerPoints.labelMode || GGB.LabelMode.Value,
      },
      lineThickness: settings && settings.lineThickness || 4,
      pointSize: settings && settings.pointSize || 2,
      rootPoint: settings && settings.rootPoint || {},
      showSizes: settings && settings.showSizes,
      shapeSizeToCalculateSizeDepth: settings && settings.shapeSizeToCalculateSizeDepth
    };
  }

  // static fromJson(json: GeogebraObjectJson): GeogebraObject {
  //   switch (json.kind) {
  //     case "text" :
  //       return TextGGO.fromJson(json);
  //     case "point" :
  //       return PointGGO.fromJson(json);
  //     case "vector" :
  //       return VectorGGO.fromJson(json);
  //     case "segment" :
  //       return SegmentGGO.fromJson(json);
  //     case "custom_axes" :
  //       return CustomAxesGGO.fromJson(json);
  //     case "ellipse" :
  //       return EllipseGGO.fromJson(json);
  //     case "kutyk" :
  //       return KutykGGO.fromJson(json);
  //     case "plate" :
  //       return PlateGGO.fromJson(json);
  //     case "shveller" :
  //       return ShvellerGGO.fromJson(json);
  //     case "dvotavr":
  //       return DvotavrGGO.fromJson(json);
  //     default:
  //       throw new Error(`Unknown GeogebraObject kind ${json.kind} in json ${json}`)
  //   }
  // }
}
