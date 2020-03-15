import { GeogebraObject } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";

/**
 * Group of geogebra objects
 */
export class GeogebraObjectGroup {
  constructor(public objects: GeogebraObject[]) {
  }

  rotate(angle: Angle, point?: XYCoords): GeogebraObjectGroup {
    const p = point || new XYCoords(0, 0);
    this.objects.forEach(o => o.rotate(angle, p));
    return this
  }

  copy(): GeogebraObjectGroup {
    return new GeogebraObjectGroup(this.objects.map(o => o.copy()));
  }

  getCommands(): string[] {
    return this.objects.map(o => o.getCommands()).reduce((prev, cur) => prev.concat(cur), [])
  }

  maxCoord(): XYCoordsJson {
    const maxCoords = this.objects.map(o => o.maxCoord());
    return {
      x: Math.max(...maxCoords.map(c => c.x)),
      y: Math.max(...maxCoords.map(c => c.y)),
    }
  }

  minCoord(): XYCoordsJson {
    const minCoords = this.objects.map(o => o.minCoord());
    return {
      x: Math.min(...minCoords.map(c => c.x)),
      y: Math.min(...minCoords.map(c => c.y)),
    }
  }

  getDeleteCommands(): string[] {
    return this.objects.map(o => o.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur), [])
  }

  getCenterCoords(): XYCoordsJson {
    const centerCoords = this.objects.map(o => o.getCenterCoords());
    return {
      x: centerCoords.reduce((prev, cur) => prev + cur.x, 0) / centerCoords.length,
      y: centerCoords.reduce((prev, cur) => prev + cur.y, 0) / centerCoords.length,
    }
  }

  getDimensions(): { width: number; height: number } {
    const minC = this.minCoord();
    const maxC = this.maxCoord();
    return {
      width: Math.abs(maxC.x - minC.x),
      height: Math.abs(maxC.y - minC.y),
    }
  }
}
