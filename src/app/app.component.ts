import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { NomeParticipantesComponent } from './components/nome-participantes/nome-participantes.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    NomeParticipantesComponent,
    FormsModule,
    RouterModule,
  ],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tic-tac-toe-pwa-angular';

  constructor(private router: Router) {}
  onStartGame(event: { player1: string; player2: string }) {
    console.log('Jogo iniciado com:', event);
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}
