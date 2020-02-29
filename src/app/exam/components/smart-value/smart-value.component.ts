import { Component, Input, OnInit } from '@angular/core';
import { NumberUtils } from "../../../utils/NumberUtils";

export const SmartValueType = {
  input: 'SmartValueInputDto',
  staticString: 'SmartValueStaticString',
  dynamicDouble: 'SmartValueDynamicDouble',
  staticDouble: 'SmartValueStaticDouble'
};

export interface SmartValueInputDto {
  id: number
  answerMapping: string
}

export interface SmartValueStrDto {
  value: string
}

export interface SmartValueDoubleDto {
  answerMapping: string
  value: number
  digitsAfterComma: number
}

export type SmartValueContainer = { [key:string]: SmartValueInputDto | SmartValueStrDto | SmartValueDoubleDto }

export interface SmartValueDoubleInput {
  id: number
  value: number
}

export class SmartValue {
  static fromContainer(container: SmartValueContainer) {
    const keys = Object.keys(container);
    let valueType;
    if(keys.length  === 1) { valueType = keys[0] } else { throw new Error(`Invalid item value: ${JSON.stringify(container)}`) }
    let valueItself = container[valueType];
    let result = new SmartValue(valueType, null);
    switch(valueType) {
      case SmartValueType.input:
        valueItself = valueItself as SmartValueInputDto;
        result.value = {
          id: valueItself.id,
          value: null
        };
        break;
      case SmartValueType.staticString:
        result.value = valueItself as SmartValueStrDto;
        break;
      case SmartValueType.staticDouble:
      case SmartValueType.dynamicDouble:
        valueItself = valueItself as SmartValueDoubleDto;
        result.value = valueItself;
        result.value.value = parseFloat(NumberUtils.roundToFixed(valueItself.value, valueItself.digitsAfterComma));
        break;
      default:
        throw new Error(`Invalid smart value type: ${valueType}`)
    }
    return result
  }
  constructor(public type: string, public value: SmartValueDoubleInput | SmartValueStrDto | SmartValueDoubleDto) {}
}

@Component({
  selector: 'smart-value',
  templateUrl: './smart-value.component.html',
  styleUrls: ['./smart-value.component.css']
})
export class SmartValueComponent implements OnInit {

  @Input() data: SmartValue;
  @Input() showInputValidation: boolean = false;

  ValueType = SmartValueType;

  constructor() { }

  ngOnInit() {
  }

  valueAsStr(data: SmartValue): SmartValueStrDto {
    return data.value as SmartValueStrDto
  }

  valueAsDouble(data: SmartValue): SmartValueDoubleDto {
    return data.value as SmartValueDoubleDto
  }

}
