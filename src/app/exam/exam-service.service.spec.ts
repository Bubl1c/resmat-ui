/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExamServiceService } from './exam-service.service';

describe('ExamServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExamServiceService]
    });
  });

  it('should ...', inject([ExamServiceService], (service: ExamServiceService) => {
    expect(service).toBeTruthy();
  }));
});
