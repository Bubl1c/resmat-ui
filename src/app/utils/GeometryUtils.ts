export class GeometryUtils {

  public static evalSegmentCenter(xa: number, ya: number, xb: number, yb: number): { x: number, y: number } {
    return {
      x: (xa + xb)/2,
      y: (ya + yb)/2
    }
  }

}
