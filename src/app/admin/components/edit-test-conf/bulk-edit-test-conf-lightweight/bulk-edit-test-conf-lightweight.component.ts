import {
  AfterViewInit,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  IterableDiffer,
  IterableDiffers,
  OnInit,
  Output
} from '@angular/core';
import { TestEdit } from "../edit-test-conf.component";
import { GeogebraObject } from "../../../../components/geogebra/custom-objects/geogebra-object";
import { HtmlUtils } from "../../../../utils/html-utils";
import { DocxParser } from "../../../../utils/docx-parser";
import { error } from "util";

export interface PagedTest {
  test: TestEdit
  originalIndex: number
}

export interface PageWithTests {
  id: number
  startIndex: number
  endIndex: number
  tests: PagedTest[]
}

@Component({
  selector: 'bulk-edit-test-conf-lightweight',
  templateUrl: './bulk-edit-test-conf-lightweight.component.html',
  styleUrls: ['./bulk-edit-test-conf-lightweight.component.css']
})
export class BulkEditTestConfLightweightComponent implements OnInit, DoCheck, AfterViewInit {

  @Input() groupId: number;
  @Input() tests: TestEdit[];
  @Input() isSaving: boolean;

  @Output() onSaved = new EventEmitter<TestEdit[]>();

  pageSize = 10;

  currentPage: PageWithTests;
  pages: number[];

  private iterableDiffer: IterableDiffer;

  constructor(iterableDiffers: IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(undefined);
  }

  ngOnInit() {
    this.recalculatePages()
  }

  ngAfterViewInit(): void {
  }

  ngDoCheck() {
    let changes = this.iterableDiffer.diff(this.tests);
    if (changes) {
      this.recalculatePages(this.currentPage && this.currentPage.id)
    }
  }

  fileAdded(file: File) {
    const groupId = this.groupId;
    this.isSaving = true;
    DocxParser.loadFileAndParseOutTests(file).then(tests => {
      if (tests.length < 1) {
        alert("В вибраному файлі не знайдено жодного тесту");
        return;
      }
      const tes = tests.map((t, i) => {
        return TestEdit.fromSimple(groupId, -1, -1, t)
      });
      this.tests.unshift(...tes);
      this.recalculatePages(1);
      alert(`Завантажені тести успішно додані під номерами 1 - ${tes.length}. Але НЕ ЗБЕРЕЖЕНІ, натисніть ЗБЕРЕГТИ щоб підтвердити додані тести.`);
    }, error => {
      alert("Не вдалося завантажити тести з файлу. Причина: " + JSON.stringify(error))
    }).then(() => {
      this.isSaving = false;
    })
  };

  deleteTest(index: number) {
    const test = this.tests[index];
    if (!test.question && test.options.length < 2 || window.confirm("Ви дійсно хочете видалити тест із запитанням '" + test.question + "'?")) {
      this.tests.splice(index, 1);
      this.recalculatePages(this.currentPage.id)
    }
  }

  addTest(index: number) {
    const newTest = new TestEdit();
    newTest.groupId = this.groupId;
    this.tests.splice(index, 0, newTest);
    this.recalculatePages(this.currentPage.id)
  }

  save() {
    this.onSaved.emit(this.tests);
  }

  recalculatePages(selectedPage?: number) {
    const testCount = this.tests.length;
    const pageCount = Math.ceil(testCount / this.pageSize);
    this.pages = [];
    for(let i = 1; i <= pageCount; i++) {
      this.pages.push(i)
    }
    const pageToLoad = (selectedPage && selectedPage > 0 && selectedPage <= pageCount) ? selectedPage : 1;
    const startIndex = pageToLoad === 1 ? 0 : pageToLoad * this.pageSize - this.pageSize;
    const projectedEndIndex = startIndex + this.pageSize;
    const endIndex = projectedEndIndex > testCount ? testCount : projectedEndIndex;
    const currentPageTests = this.tests.slice(startIndex, endIndex)
    this.currentPage = {
      id: pageToLoad,
      startIndex: startIndex,
      endIndex: endIndex,
      tests: currentPageTests.map((t, index) => ({
        originalIndex: startIndex + index,
        test: t
      }))
    }
  }

  trackTest(index, test: PagedTest) {
    return test ? test.test.id : undefined;
  }

}
