import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { InputVariable, InputSetData, InputSetAnswer } from "../../../exam/components/input-set/input-set.component";
import { ApiService } from "../../../api.service";
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { CustomModal } from "../custom-modal/custom-modal.component";
import { overlayConfigFactory } from "angular2-modal";
import { ErrorResponse } from "../../../utils/HttpUtils";
import {
  InputVariableValuesProblemInputConf, InputVariableValuesProblemVariantInputData,
  ProblemConf, ProblemInputVariableConf,
  ProblemVariantConf,
  ProblemVariantInputData,
  ProblemVariantSchemaType
} from "../../../steps/exam.task-flow-step";
import { GeogebraObject } from "../../../components/geogebra/custom-objects/geogebra-object";
import { GeometryShapeJson } from "../../../components/geogebra/custom-objects/geometry-shape";

export interface IProblemInputVariableConf {
  id: number;
  name: string;
  units: string;
  alias: string;
  showInExam: boolean
}

export interface ProblemConfWithVariants {
  problemConf: ProblemConf
  variants: ProblemVariantConfWithCalculatedData[]
}

export interface ProblemVariantConfWithCalculatedData extends ProblemVariantConf {
  calculatedData: any
}

export interface NewProblemVariantConfDto {
  schemaType: ProblemVariantSchemaType;
  schemaUrl: string;
  inputData: ProblemVariantInputData
}

@Component({
  selector: 'problem-conf',
  templateUrl: './problem-conf.component.html',
  styleUrls: ['./problem-conf.component.css']
})
export class ProblemConfComponent implements OnInit {
  @Input()
  problemConfWithVariants: ProblemConfWithVariants;

  @Output()
  onCreate = new EventEmitter<NewProblemVariantConfDto>();

  problemConfInfo: any;

  isProblemConfHidden: boolean = true;

  variableConfs: { [key:string]:IProblemInputVariableConf; } = {};

  newVariant: ProblemVariantConf = {} as ProblemVariantConf;
  newVariantVariables: InputSetData;
  showInputSet = true;

  //for Cross section
  newVariantObjects: GeogebraObject[] = [];

  constructor(private api: ApiService, public modal: Modal) { }

  ngOnInit() {

    this.problemConfInfo = JSON.parse(JSON.stringify(this.problemConfWithVariants.problemConf));

    const problemType = this.problemConfWithVariants.problemConf.problemType;
    switch (problemType) {
      case "ring-plate":
        const inputVariableConfs = (this.problemConfWithVariants.problemConf.inputConf as InputVariableValuesProblemInputConf)
          .InputVariableValuesProblemInputConf.inputVariableConfs;
        for(let v of inputVariableConfs) {
          v.name = MathSymbolConverter.convertString(v.name);
          this.variableConfs[v.id] = v
        }
        break;
      case "cross-section":
        break;
      default:
        throw new Error(`Unsupported ProblemType ${problemType} in ProblemConf ${JSON.stringify(this.problemConfWithVariants.problemConf)}`)
    }

    this.reset()
  }

  variablesSubmitted(variables: InputSetAnswer) {
    if(!this.newVariant.schemaUrl) {
      alert("Необхідно заповнити посилання на схему");
      return;
    }
    const variantToSave: NewProblemVariantConfDto = {
      schemaUrl: this.newVariant.schemaUrl,
      schemaType: "img-url",
      inputData: {
        InputVariableValuesProblemVariantInputData: {
          inputVariableValues: variables.inputAnswers.map(v => {
            return {
              variableConfId: v.id,
              value: v.value
            }
          })
        }
      }
    };
    this.saveVariant(variantToSave)
  }

  shapesSubmitted(objects: GeogebraObject[]) {
    const shapeJsons = objects.map(o => o.invert().toJson());
    const variantToSave: NewProblemVariantConfDto = {
      schemaUrl: JSON.stringify(shapeJsons),
      schemaType: "geogebra",
      inputData: {
        GeometryShapesProblemVariantInputData: {
          shapes: shapeJsons
        }
      }
    };
    this.saveVariant(variantToSave)
  }

  private saveVariant(variant: NewProblemVariantConfDto): void {
    this.api.post("/problem-confs/" + this.problemConfWithVariants.problemConf.id + "/variants", variant).subscribe(saved => {
      this.problemConfWithVariants.variants.unshift(saved);
      this.reset();
      alert("Успішно збережено")
    }, error => alert(JSON.stringify(error)))
  }

  loadCalculatedData(v: ProblemVariantConfWithCalculatedData) {
    this.modal.open(CustomModal,  overlayConfigFactory({ custom_json: v.calculatedData }, BSModalContext));
  }

  loadInputData(v: ProblemVariantConfWithCalculatedData) {
    this.modal.open(CustomModal,  overlayConfigFactory({ custom_json: v.inputData }, BSModalContext));
  }

  deleteVariant(v: ProblemVariantConfWithCalculatedData) {
    let that = this;
    function onDeleted() {
      var index = that.problemConfWithVariants.variants.findIndex(vinarr => vinarr.id === v.id);
      if (index > -1) {
        that.problemConfWithVariants.variants.splice(index, 1);
      }
    }

    if(window.confirm("Ви дійсно хочете видалити варіант " + v.id + "?")) {
      const problemConfId = this.problemConfWithVariants.problemConf.id;
      this.api.delete("/problem-confs/" + problemConfId + "/variants/" + v.id).subscribe(() => {
        onDeleted();
        alert("Успішно видалено")
      }, (error: ErrorResponse) => {
        if(error.status === 424) {
          if(window.confirm("Цей варіант вже використовується, видалити разом з усіма сутностями які його використовують?")) {
            this.api.delete("/problem-confs/" + problemConfId + "/variants/" + v.id + "?force=true").subscribe(() => {
              onDeleted();
              alert("Успішно видалено")
            }, (error: ErrorResponse) => alert("Не вдалося видалити: " + JSON.stringify(error)))
          }
        } else {
          alert("Не вдалося видалити: " + JSON.stringify(error))
        }
      })
    }
  }

  reset() {
    this.showInputSet = false;
    this.newVariant.schemaUrl = null;
    this.resetVariableValues();
    setTimeout(() => {
      this.showInputSet = true;
    });

    this.newVariantObjects = []
  }

  resetVariableValues() {
    if (this.problemConfWithVariants.problemConf.problemType === "ring-plate") {
      const inputVariableConfs = (this.problemConfWithVariants.problemConf.inputConf as InputVariableValuesProblemInputConf)
        .InputVariableValuesProblemInputConf.inputVariableConfs;
      this.newVariantVariables = new InputSetData(-1, -1, "", inputVariableConfs.map(vc => {
        return new InputVariable(vc.id, vc.name, "", vc.units, "", true)
      }), []);
    }
  }

}
