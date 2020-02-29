import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { InputVariable, InputSetData, InputSetAnswer } from "../../../exam/components/input-set/input-set.component";
import { ApiService } from "../../../api.service";
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { CustomModal } from "../custom-modal/custom-modal.component";
import { overlayConfigFactory } from "angular2-modal";
import { ErrorResponse } from "../../../utils/HttpUtils";

export interface IProblemConf {
  id: number;
  name: string;
  problemType: string;
  inputVariableConfs: IProblemInputVariableConf[]
}

export interface IProblemInputVariableConf {
  id: number;
  name: string;
  units: string;
  alias: string;
  showInExam: boolean
}

export interface IProblemConfWithVariants extends IProblemConf {
  variants: IProblemVariantConf[]
}

export interface IProblemVariantConf {
  id: number
  problemConfId: number
  schemaUrl: string
  inputVariableValues: IProblemInputVariableValue[]
  calculatedData: any
}

export interface IProblemInputVariableValue {
  variableConfId: number
  value: number
}

export interface INewVariantConf {
  schemaUrl: string
  inputVariableValues: IProblemInputVariableValue[]
}

@Component({
  selector: 'problem-conf',
  templateUrl: './problem-conf.component.html',
  styleUrls: ['./problem-conf.component.css']
})
export class ProblemConfComponent implements OnInit {
  @Input()
  problemConf: IProblemConfWithVariants;

  @Input()
  variants: IProblemVariantConf[];

  @Output()
  onCreate = new EventEmitter<INewVariantConf>();

  problemConfInfo: any;

  isProblemConfHidden: boolean = true;

  variableConfs: { [key:string]:IProblemInputVariableConf; } = {};

  newVariant: IProblemVariantConf = {} as IProblemVariantConf;
  newVariantVariables: InputSetData;
  showInputSet = true;

  constructor(private api: ApiService, public modal: Modal) { }

  ngOnInit() {

    this.problemConf.inputVariableConfs.forEach(iv => {
      iv.name = MathSymbolConverter.convertString(iv.name)
    });

    this.problemConfInfo = {
      id: this.problemConf.id,
      name: this.problemConf.name,
      problemType: this.problemConf.problemType,
      inputVariableConfs: this.problemConf.inputVariableConfs
    };

    for(let v of this.problemConf.inputVariableConfs) {
      this.variableConfs[v.id] = v
    }

    this.reset()
  }

  variablesSubmitted(variables: InputSetAnswer) {
    if(!this.newVariant.schemaUrl) {
      alert("Необхідно заповнити посилання на схему");
      return;
    }
    let variantToSave = {
      schemaUrl: this.newVariant.schemaUrl,
      inputVariableValues: variables.inputAnswers.map(v => {
        return {
          variableConfId: v.id,
          value: v.value
        }
      })
    };

    this.api.post("/problem-confs/" + this.problemConf.id + "/variants", variantToSave).subscribe(saved => {
      this.variants.unshift(saved);
      this.reset()
      alert("Успішно збережено")
    }, error => alert(JSON.stringify(error)))
  }

  loadCalculatedData(v: IProblemVariantConf) {
    this.modal.open(CustomModal,  overlayConfigFactory({ custom_json: v.calculatedData }, BSModalContext));
  }

  deleteVariant(v: IProblemVariantConf) {
    let that = this;
    function onDeleted() {
      var index = that.variants.findIndex(vinarr => vinarr.id === v.id);
      if (index > -1) {
        that.variants.splice(index, 1);
      }
    }

    if(window.confirm("Ви дійсно хочете видалити варіант " + v.id + "?")) {
      this.api.delete("/problem-confs/" + this.problemConf.id + "/variants/" + v.id).subscribe(() => {
        onDeleted();
        alert("Успішно видалено")
      }, (error: ErrorResponse) => {
        if(error.status === 424) {
          if(window.confirm("Цей варіант вже використовується, видалити разом з усіма сутностями які його використовують?")) {
            this.api.delete("/problem-confs/" + this.problemConf.id + "/variants/" + v.id + "?force=true").subscribe(() => {
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
    this.newVariantVariables = new InputSetData(-1, -1, "", this.problemConf.inputVariableConfs.map(vc => {
      return new InputVariable(vc.id, vc.name, "", vc.units, "", true)
    }), []);
    setTimeout(() => {
      this.showInputSet = true;
    });
  }

}
