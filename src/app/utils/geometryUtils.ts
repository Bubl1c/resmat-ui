import { NumberUtils } from "./NumberUtils";

export class GeometryUtils {

  public static segmentCenter(a: XYCoordsJson, b: XYCoordsJson): XYCoordsJson {
    return {
      x: (a.x + b.x)/2,
      y: (a.y + b.y)/2
    }
  }

  /**
   * distance == segmentLength(a, result)
   * a----------b     .result
   *
   * Result can also be within (a, b)
   * @param a
   * @param b
   * @param distance
   */
  public static pointOnVector(a: XYCoordsJson, b: XYCoordsJson, distance?: number): XYCoordsJson {
    const fullLength = GeometryUtils.segmentLength(a, b);
    const k = distance ? distance / fullLength : 1;
    return {
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
    }
  }

  /**
   * a------b------result
   * Returns a point opposite to a in relation to b
   * @param a
   * @param b
   * @param oppositeDistance
   */
  public static oppositePoint(a: XYCoordsJson, b: XYCoordsJson, oppositeDistance?: number): XYCoordsJson {
    const opPoint = {
      x: a.x - (b.x - a.x),
      y: a.y - (b.y - a.y),
    };
    return GeometryUtils.pointOnVector(a, opPoint, oppositeDistance)
  }

  public static segmentLength(a: XYCoordsJson, b: XYCoordsJson): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
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

  rotate(angle: Angle, point?: XYCoords): XYCoords {
    const p = point || new XYCoords(0, 0);
    //Translate to a new coordinate system with center at point
    let translatedX = this.x - p.x;
    let translatedY = this.y - p.y;
    //Rotate clockwise
    const cos = Math.cos(angle.radians);
    const sin = Math.sin(angle.radians);
    const rotatedX = translatedX * cos + translatedY * sin;
    const rotatedY = - translatedX * sin + translatedY * cos;
    //Go back to the original coordinate system
    this.x = NumberUtils.accurateRound(rotatedX + p.x, 2);
    this.y = NumberUtils.accurateRound(rotatedY + p.y, 2);
    return this
  }

  getCommand(): string {
    return `(${this.x},${this.y})`
  }

  updX(updatedX: (currentX: number) => number): XYCoords {
    const s = this.copy();
    s.x = updatedX(s.x);
    return s;
  }

  updY(updatedY: (currentY: number) => number): XYCoords {
    const s = this.copy();
    s.y = updatedY(s.y);
    return s;
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
