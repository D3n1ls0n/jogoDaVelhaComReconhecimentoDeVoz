import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareComponent } from '../square/square.component';
import { NomeParticipantesComponent } from '../nome-participantes/nome-participantes.component';
import { ActivatedRoute } from '@angular/router';

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
  player1Name: string | null = null;
  player1Piece: string | null = null;
  player2Name: string | null = null;
  player2Piece: string | null = null;
  countdown: number = 0;
  showCountdown = true;
  showStartMessage = false;
  isMachinePlaying = false;
  records: { name: string, wins: number }[] = [];

  constructor(private ngZone: NgZone, private route: ActivatedRoute) {
    this.newGame();
  }

  startGame(event: { player1: string; player2: string }) {
    this.player1 = event.player1;
    this.player2 = event.player2;
    console.log(this.player1, this.player2);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.player1Name = params['player1'];
      this.player1Piece = params['player1Piece'];
      this.player2Name = params['player2'];
      this.player2Piece = params['player2Piece'];

      if (this.player2Name === 'Máquina') {
        this.isMachinePlaying = true;
      }
    });
    this.startCountdown();
    this.loadRecords();
    this.newGame();
    this.setupVoiceRecognition();
    console.log(this.xIsNext, this.isMachinePlaying,this.winner);

  }

  startCountdown() {
    this.countdown = 3;
    const interval = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        clearInterval(interval);
        this.showCountdown = false;
        this.showStartMessage = true;
        setTimeout(() => {
          this.showStartMessage = false;
        }, 2000);
      }
    }, 1000);
  }

  newGame() {
    this.squares = Array(9).fill(null);
    this.winner = '';

    if (this.player1Piece === 'X') {
      this.xIsNext = true;
    } else {
      this.xIsNext = false;
    }
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
      this.xIsNext = !this.xIsNext; // Toggle the next player

      const winnerData = this.calculateWinner();
      if (winnerData) {
        this.winner = winnerData.winner;
        this.winningSquares = winnerData.line;
        this.saveWinner(winnerData.winner === 'X' ? this.player1Name : this.player2Name);
        return; // Exit if there's a winner
      } else if (this.noOneWonTheGame()) {
        this.winner = 'Empate';
        return; // Exit if there's a draw
      }
console.log("Valor Real",this.xIsNext);
console.log("Valor mudado",!this.xIsNext);

      // Check if it's the machine's turn
      if (!this.xIsNext && this.isMachinePlaying && (!this.winner || this.winner == '')) {
        setTimeout(() => {
          this.makeMachineMove();
        }, 1000); // Delay the machine's move
      }
    }
  }

  makeMachineMove() {
    const emptySquares = this.squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    if (randomIndex !== null && randomIndex !== undefined) {
      this.makeMove(randomIndex);
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
      if (this.squares[a] && this.squares[a] === this.squares[b] && this.squares[a] === this.squares[c]) {
        return { winner: this.squares[a], line: lines[i] };
      }
    }
    return null;
  }

  saveWinner(winnerName: string | null) {
    if (!winnerName) return;
    const record = this.records.find(record => record.name === winnerName);
    if (record) {
      record.wins += 1;
    } else {
      this.records.push({ name: winnerName, wins: 1 });
    }
    this.saveRecords();
  }

  loadRecords() {
    const records = localStorage.getItem('tictactoe-records');
    if (records) {
      this.records = JSON.parse(records);
      this.records.sort((a, b) => b.wins - a.wins);
    }
  }

  saveRecords() {
    localStorage.setItem('tictactoe-records', JSON.stringify(this.records));
  }

  setupVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'pt-BR';

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
    } else if (
      ['novo jogo', 'recomeçar', 'jogar novamente'].includes(command.toLowerCase())
    ) {
      this.newGame();
    } else {
      console.log('Command not recognized:', command);
    }
  }
}
