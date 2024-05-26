import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareComponent } from '../square/square.component';
import { NomeParticipantesComponent } from '../nome-participantes/nome-participantes.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, SquareComponent, NomeParticipantesComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  squares!: any[];
  xIsNext!: boolean;
  winner!: string;
  winningSquares: number[] = [];
  recognition: any;
  player1: string = '';
  player2: string = '';
  constructor(private ngZone: NgZone) {
    this.newGame();
  }



  startGame(event: { player1: string, player2: string }) {
    this.player1 = event.player1;
    this.player2 = event.player2;
    console.log( this.player1,  this.player2);

    // Iniciar o jogo com os nomes dos participantes
  }

  ngOnInit() {
    this.setupVoiceRecognition();
  }

  newGame() {
    this.squares = Array(9).fill(null);
    this.winner = '';
    this.xIsNext = true;
    this.winningSquares = [];
  }

  get player() {
    return this.xIsNext ? 'X' : 'O';
  }

  canMakeMove(idx: number): boolean {
    const noWinner = !this.winner;
    const squareIsEmpty = !this.squares[idx];
    return noWinner && squareIsEmpty;
  }

  makeMove(idx: number) {
    if (this.canMakeMove(idx)) {
      this.squares.splice(idx, 1, this.player);
      this.xIsNext = !this.xIsNext;
    }

    const winnerData = this.calculateWinner();
    if (winnerData) {
      this.winner = winnerData.winner;
      this.winningSquares = winnerData.line;
    }
  }

  noOneWonTheGame(): boolean {
    return this.squares.every((square) => square !== null);
  }

  calculateWinner(): { winner: string; line: number[] } | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        this.squares[a] &&
        this.squares[a] === this.squares[b] &&
        this.squares[a] === this.squares[c]
      ) {
        return { winner: this.squares[a], line: lines[i] };
      }
    }
    return null;
  }

  setupVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      //this.recognition.lang = 'en-US';
      this.recognition.lang = 'pt-BR'; //pt-BR

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          const transcript =
            event.results[event.resultIndex][0].transcript.trim();
          this.handleVoiceCommand(transcript);
        });
      };

      this.recognition.start();
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.');
    }
  }

  handleVoiceCommand(command: string) {
    const moveCommands = [
      'superior esquerdo',
      'superior meio',
      'superior direito',
      'meio esquerdo',
      'centro',
      'meio direito',
      'inferior esquerdo',
      'inferior meio',
      'inferior direito',
    ];
    const moveIndex = moveCommands.indexOf(command.toLowerCase());

    if (moveIndex > -1) {
      this.makeMove(moveIndex);
    } else if (['novo jogo', 'recomeçar', 'jogar novamente'].includes(command.toLowerCase())) {
      this.newGame();
    } else {
      console.log('Command not recognized:', command);
    }
  }
}
