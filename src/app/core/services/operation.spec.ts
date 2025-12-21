import { TestBed } from '@angular/core/testing';

import { Operation } from './operation';

describe('Operation', () => {
  let service: Operation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Operation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
