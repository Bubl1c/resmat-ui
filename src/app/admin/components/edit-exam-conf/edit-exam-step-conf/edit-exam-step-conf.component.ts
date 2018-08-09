import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExamStepTypes, IExamStepConf, IExamStepTestSetDataSet } from "../../../../exam/data/exam.api-protocol";
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto } from "../../../../exam/data/test-set.api-protocol";
import { ApiService } from "../../../../api.service";

@Component({
  selector: 'edit-exam-step-conf',
  templateUrl: './edit-exam-step-conf.component.html',
  styleUrls: ['./edit-exam-step-conf.component.css']
})
export class EditExamStepConfComponent implements OnInit {

  @Input() data: IExamStepConf;
  @Input() sequenceDropdownOptions: DropdownOption[];
  @Input() isReadonly: Boolean = false;

  @Output() onSequenceChanged = new EventEmitter<number>();
  @Output() onDeleted = new EventEmitter<void>();

  stepData: ITestSetConfDto;
  isStepDataLoading: Boolean = true;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    switch (this.data.stepType) {
      case ExamStepTypes.TestSet:
        this.isStepDataLoading = true;
        let dataSet = this.data.dataSet as IExamStepTestSetDataSet;
        this.api.get(
          `/test-set-confs/${dataSet.ExamStepTestSetDataSet.testSetConfId}`
        ).subscribe((resp: ITestSetConfDto) => {
          this.isStepDataLoading = false;
          this.stepData = resp
        }, error => {
          alert("Не вдалося завантажити конфігурацію набору тестів. " + JSON.stringify(error))
          this.isStepDataLoading = false;
        });
        break;
      default:
        // do nothing
    }
  }

  saveTestSetConf(testSetConf: ITestSetConfDto) {
    console.log("Saving test set conf", testSetConf)
  }

  sequenceChanged(newValue: DropdownOption) {
    this.onSequenceChanged.emit(newValue.id);
  }

  toggleHasToBeSubmitted() {
    this.data.hasToBeSubmitted = !this.data.hasToBeSubmitted;
  }

  delete() {
    this.onDeleted.emit()
  }

}
