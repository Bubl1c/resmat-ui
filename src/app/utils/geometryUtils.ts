import { NumberUtils } from "./NumberUtils";

export class GeometryUtils {

  public static segmentCenter(xa: number, ya: number, xb: number, yb: number): { x: number, y: number } {
    return {
      x: (xa + xb)/2,
      y: (ya + yb)/2
    }
  }

  public static opositePoint(xa: number, ya: number, xb: number, yb: number): { x: number, y: number } {
    const xba = xb - xa;
    const yba = yb - ya;
    return {
      x: xa - xba,
      y: ya - yba
    }
  }
}

export namespace CoordsUtils {
  export function XY(x: number, y: number): XYCoords {
    return new XYCoords(x, y)
  }
}

export interface XYCoordsJson {
  x: number
  y: number
}

export class XYCoords implements XYCoordsJson {
  static fromJson(json: XYCoordsJson): XYCoords {
    return new XYCoords(json.x, json.y)
  }

  constructor(public x: number, public y: number) {}
  copy(): XYCoords {
    return new XYCoords(this.x, this.y)
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): XYCoords {
    //Translate to a new coordinate system with center at point
    let translatedX = this.x - point.x;
    let translatedY = this.y - point.y;
    //Rotate clockwise
    const cos = Math.cos(angle.radians);
    const sin = Math.sin(angle.radians);
    const rotatedX = translatedX * cos + translatedY * sin;
    const rotatedY = - translatedX * sin + translatedY * cos;
    //Go back to the original coordinate system
    this.x = NumberUtils.accurateRound(rotatedX + point.x, 2);
    this.y = NumberUtils.accurateRound(rotatedY + point.y, 2);
    return this
  }

  getCommand(): string {
    return `(${this.x},${this.y})`
  }

  toJson(): XYCoordsJson {
    return {
      x: this.x,
      y: this.y
    }
  }
}

export enum AngleType {
  Degrees,
  Radians
}
export class Angle {
  public degrees: number;
  public radians: number;

  constructor(angle: number, angleType: AngleType = AngleType.Degrees) {
    switch (angleType) {
      case AngleType.Degrees:
        this.degrees = angle;
        this.radians = angle * (Math.PI/180);
        break;
      case AngleType.Radians:
        this.degrees = angle / (Math.PI/180);
        this.radians = angle;
        break;
      default:
        throw new Error("Unhandled angle type: " + angleType)
    }
  }
}
