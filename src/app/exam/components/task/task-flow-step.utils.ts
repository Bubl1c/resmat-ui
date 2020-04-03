import { DrawingStepAnswer, GeometryShapeUtils } from "../../../components/geogebra/custom-objects/geometry-shape";
import { GeogebraObject } from "../../../components/geogebra/custom-objects/geogebra-object";
import { CustomAxesGGO } from "../../../components/geogebra/custom-objects/custom-axes-ggo";
import { GeogebraObjectUtils } from "../../../components/geogebra/custom-objects/geogebra-object-utils";
import { Angle, XYCoords } from "../../../utils/geometryUtils";
import { GeogebraComponentSettings } from "../../../components/geogebra/geogebra.component";
import { SmartValue } from "../smart-value/smart-value.component";
import { DynamicTable } from "../dynamic-table/dynamic-table.component";
import {
  Equation,
  EquationDto,
  EquationItemValue, EquationItemValueDto,
  EquationItemValueType,
  EquationSystemDto, ItemValueDouble, ItemValueInput, ItemValueStr
} from "../equation/equation.component";
import { EquationSet } from "../equation-set/equation-set.component";
import { VarirableAnswer } from "../input-set/input-set.component";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { NumberUtils } from "../../../utils/NumberUtils";

export interface GeogebraComponentInput {
  geogebraObjects: GeogebraObject[]
  geogebraComponentSettings: GeogebraComponentSettings
}

export class TaskFlowStepUtils {

  static prepareEquationSet(data: EquationSystemDto, stepName: string, sequence: number): EquationSet {
    const es = new EquationSet(1, sequence, stepName, data.equations.map(e => TaskFlowStepUtils.fillEquation(e)));
    return es;
  }

  private static fillEquation(eqDto: EquationDto): Equation {
    const items = eqDto.items.map(i => {
      const valueType = TaskFlowStepUtils.getItemValueType(i.value);
      let value = i.value[valueType];
      let newValue: EquationItemValue = {
        type: valueType,
        value: null
      };
      switch(valueType) {
        case EquationItemValueType.input:
          value = (value as ItemValueInput);
          newValue.value = new VarirableAnswer(value.id, null, value.labelKey);
          break;
        case EquationItemValueType.staticString:
          value = (value as ItemValueStr);
          newValue.value = MathSymbolConverter.convertString(value.value);
          break;
        case EquationItemValueType.dynamicDouble:
          value = (value as ItemValueDouble);
          value.value = parseFloat(NumberUtils.roundToFixed(value.value, value.digitsAfterComma));
          newValue.value = value;
          break;
        case EquationItemValueType.dynamicString:
          value = (value as ItemValueStr);
          newValue.value = MathSymbolConverter.convertString(value.value);
          break;
        default:
          throw new Error(`Unsupported EquationItemValueType ${valueType} in EquationDto ${JSON.stringify(eqDto)}`)
      }
      return {
        value: newValue,
        prefix: i.prefix,
        suffix: i.suffix
      };
    });
    return {
      id: eqDto.id,
      items: items
    }
  }

  private static getItemValueType(itemValue: EquationItemValueDto): string {
    const keys = Object.keys(itemValue);
    if(keys.length  === 1) {
      return keys[0]
    } else {
      throw new Error('Invalid item value: ' + JSON.stringify(itemValue))
    }
  }

  static prepareDynamicTable(data: DynamicTable): DynamicTable {
    data.rows.forEach(r => {
      r.cells = r.cells.map(c => SmartValue.fromContainer(c as any))
    });
    return data;
  }

  static prepareDrawingHelpStepData(json: DrawingStepAnswer): GeogebraComponentInput {
    json.shapes = JSON.parse(json.shapes as any as string); // it comes from API as a string
    const geogebraObjects: GeogebraObject[] = [];
    json.shapes.forEach(j => {
      const customAxesSettings = j.settings && j.settings.customAxesSettings;
      const isInverted = j.settings && j.settings.isInverted;
      const shape = GeometryShapeUtils.parseGeometryShape(j.shape, isInverted);
      geogebraObjects.push(shape);
      const shapeDimensions = shape.getDimensions();
      if (customAxesSettings) {
        const caGGO = new CustomAxesGGO(
          GeogebraObjectUtils.nextId(),
          "CustomAxes" + shape.id,
          XYCoords.fromJson(shape.getCenterCoords()),
          shapeDimensions.width,
          shapeDimensions.height,
          {
            xAxisName: `${customAxesSettings.xAxisName}${shape.id}`,
            yAxisName: `${customAxesSettings.yAxisName}${shape.id}`
          }
        );
        geogebraObjects.push(isInverted ? caGGO.rotate(new Angle(180)) : caGGO)
      }
    });
    const customAxesSettings = json.settings && json.settings.customAxesSettings;
    const geogebraComponentSettings = GeogebraComponentSettings.GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG(customAxesSettings, true, 800, 800);
    return {
      geogebraObjects,
      geogebraComponentSettings
    };
  }

}
