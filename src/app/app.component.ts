import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { NomeParticipantesComponent } from './components/nome-participantes/nome-participantes.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent, NomeParticipantesComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tic-tac-toe-pwa-angular';
  onStartGame(event: { player1: string, player2: string }) {
    console.log('Jogo iniciado com:', event);
  }
}
