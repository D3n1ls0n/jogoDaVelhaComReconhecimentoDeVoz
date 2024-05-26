import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NomeParticipantesComponent } from './nome-participantes.component';

describe('NomeParticipantesComponent', () => {
  let component: NomeParticipantesComponent;
  let fixture: ComponentFixture<NomeParticipantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NomeParticipantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NomeParticipantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
