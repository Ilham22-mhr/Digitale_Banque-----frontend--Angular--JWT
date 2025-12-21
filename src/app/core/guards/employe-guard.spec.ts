import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { employeGuard } from './employe-guard';

describe('employeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => employeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
