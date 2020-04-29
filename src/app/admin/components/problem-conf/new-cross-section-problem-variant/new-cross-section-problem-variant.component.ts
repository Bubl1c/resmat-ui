import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeogebraObject } from "../../../../components/geogebra/custom-objects/geogebra-object";
import { GeogebraComponentSettings } from "../../../../components/geogebra/geogebra.component";
import { GeometryShapeJson, GeometryShapeUtils } from "../../../../components/geogebra/custom-objects/geometry-shape";
import { GeogebraObjectUtils } from "../../../../components/geogebra/custom-objects/geogebra-object-utils";

@Component({
  selector: 'app-new-cross-section-problem-variant',
  templateUrl: './new-cross-section-problem-variant.component.html',
  styleUrls: ['./new-cross-section-problem-variant.component.css']
})
export class NewCrossSectionProblemVariantComponent implements OnInit {

  @Input() variantObjects: GeogebraObject[];
  @Output() onSaved = new EventEmitter<GeogebraObject[]>();

  playgroundSettings: GeogebraComponentSettings = GeogebraComponentSettings.GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG({
    xAxisName: "y0",
    yAxisName: "z0"
  }, true, 600, 600);

  constructor() { }

  ngOnInit() {
  }

  newShape(shape: GeometryShapeJson): void {
    console.log("New ggb object", shape);
    shape.id = this.generateNextId();
    const ggoObject = GeometryShapeUtils.parseGeometryShape(shape);
    this.variantObjects.push(ggoObject);
  }

  removeGGBObject(index: number): void {
    console.log("Remove ggb object", index);
    this.variantObjects.splice(index, 1);
    this.variantObjects = this.variantObjects.map((o, i) => {
      const json = o.toJson();
      json.id = i + 1;
      const object = GeometryShapeUtils.parseGeometryShape(json, false);
      return object
    })
  }

  createVariant(): void {
    this.onSaved.emit(this.variantObjects)
  }

  generateNextId = () => {
    return this.variantObjects && (this.variantObjects.length + 1) || 1;
  };

  invertRO(angle: number): number {
    return GeogebraObjectUtils.invertRotationAngle(angle)
  }

}
