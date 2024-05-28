import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { NomeParticipantesComponent } from './components/nome-participantes/nome-participantes.component';
import { BoardComponent } from './components/board/board.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dados',
    pathMatch: 'full',
  },
  {
    path: 'dados',
    component: NomeParticipantesComponent,
  },
  {
    path: 'board',
    component: BoardComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "top",
      anchorScrolling: "enabled",
      initialNavigation: "enabledBlocking",
    }),
  ],
  exports: [RouterModule],
})
export class RoutesModule {}
