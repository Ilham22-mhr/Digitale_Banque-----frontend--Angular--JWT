import { TestBed } from '@angular/core/testing';

import { Compte } from './compte';

describe('Compte', () => {
  let service: Compte;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Compte);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
