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
  squares!: any[]; // Array representing the game board
  xIsNext!: boolean; // Boolean to track which player goes next
  winner!: string; // String to hold the winner's symbol
  winningSquares: number[] = []; // Array to store winning combination squares
  recognition: any; // Variable for speech recognition instance
  player1: string = ''; // Name of player 1
  player2: string = ''; // Name of player 2
  player1Name: string | null = null; // Query parameter for player 1's name
  player1Piece: string | null = null; // Query parameter for player 1's piece
  player2Name: string | null = null; // Query parameter for player 2's name
  player2Piece: string | null = null; // Query parameter for player 2's piece
  countdown: number = 0; // Countdown timer for game start
  showCountdown = true; // Boolean to show/hide countdown
  showStartMessage = false; // Boolean to show/hide start message
  isMachinePlaying = false; // Indicates if player 2 is a machine
  records: { name: string, wins: number }[] = []; // List of game records

  constructor(private ngZone: NgZone, private route: ActivatedRoute) {
    this.newGame(); // Initialize a new game on component instantiation
  }

  startGame(event: { player1: string; player2: string }) {
    this.player1 = event.player1; // Set player 1's name
    this.player2 = event.player2; // Set player 2's name
    console.log(this.player1, this.player2); // Log player names
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Get player details from query parameters
      this.player1Name = params['player1'];
      this.player1Piece = params['player1Piece'];
      this.player2Name = params['player2'];
      this.player2Piece = params['player2Piece'];

      // Check if player 2 is a machine
      if (this.player2Name === 'Máquina') {
        this.isMachinePlaying = true;
      }
    });
    this.startCountdown(); // Start the countdown timer
    this.loadRecords(); // Load game records from localStorage
    this.newGame(); // Initialize a new game
    this.setupVoiceRecognition(); // Setup voice recognition for game commands
  }

  startCountdown() {
    this.countdown = 3; // Start countdown from 3
    const interval = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--; // Decrease countdown
      } else {
        clearInterval(interval); // Clear interval when countdown ends
        this.showCountdown = false; // Hide countdown
        this.showStartMessage = true; // Show start message
        setTimeout(() => {
          this.showStartMessage = false; // Hide start message after 2 seconds
        }, 2000);
      }
    }, 1000); // Interval of 1 second
  }

  newGame() {
    this.squares = Array(9).fill(null); // Initialize empty board
    this.winner = ''; // Reset winner

    // Set the next player based on player 1's piece
    if (this.player1Piece === 'X') {
      this.xIsNext = true;
    } else {
      this.xIsNext = false;
    }
    this.winningSquares = []; // Reset winning squares
  }

  get player() {
    return this.xIsNext ? 'X' : 'O'; // Get the current player
  }

  canMakeMove(idx: number): boolean {
    // Check if a move can be made
    const noWinner = !this.winner;
    const squareIsEmpty = !this.squares[idx];
    return noWinner && squareIsEmpty;
  }

  makeMove(idx: number) {
    if (this.canMakeMove(idx)) {
      // Make the move if valid
      this.squares.splice(idx, 1, this.player);
      this.xIsNext = !this.xIsNext; // Toggle the next player
    }

    const winnerData = this.calculateWinner(); // Check for a winner
    if (winnerData) {
      this.winner = winnerData.winner; // Set the winner
      this.winningSquares = winnerData.line; // Set the winning squares
      this.saveWinner(winnerData.winner === 'X' ? this.player1Name : this.player2Name); // Save the winner
    } else if (this.noOneWonTheGame()) {
      this.winner = 'Empate'; // Set draw if no one won
    }

    // Make a move for the machine if it's the machine's turn
    if (!this.xIsNext && this.isMachinePlaying && !this.winner) {
      setTimeout(() => {
        this.makeMachineMove();
      }, 1000); // Delay the machine's move
    }
  }

  makeMachineMove() {
    // Implement the machine's move logic
    const emptySquares = this.squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    if (randomIndex !== null && randomIndex !== undefined) {
      this.makeMove(randomIndex);
    }
  }

  noOneWonTheGame(): boolean {
    // Check if the game ended in a draw
    return this.squares.every((square) => square !== null);
  }

  calculateWinner(): { winner: string; line: number[] } | null {
    // Determine the winner if there's a winning combination
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
    // Save the winner to the records
    if (!winnerName) return;
    const record = this.records.find(record => record.name === winnerName);
    if (record) {
      record.wins += 1;
    } else {
      this.records.push({ name: winnerName, wins: 1 });
    }
    this.saveRecords(); // Save records to localStorage
  }

loadRecords() {
  // Load records from localStorage
  const records = localStorage.getItem('tictactoe-records');
  if (records) {
    this.records = JSON.parse(records);
    // Sort records by number of wins in descending order
    this.records.sort((a, b) => b.wins - a.wins);
  }
}


  saveRecords() {
    // Save records to localStorage
    localStorage.setItem('tictactoe-records', JSON.stringify(this.records));
  }

  setupVoiceRecognition() {
    // Setup voice recognition for game commands
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'pt-BR'; // Set language to Brazilian Portuguese

      this.recognition.onresult = (event: any) => {
        // Handle voice recognition result
        this.ngZone.run(() => {
          const transcript =
            event.results[event.resultIndex][0].transcript.trim();
          this.handleVoiceCommand(transcript); // Process the voice command
        });
      };
      this.recognition.start(); // Start voice recognition
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.'); // Alert if voice recognition is not supported
    }
  }

  handleVoiceCommand(command: string) {
    // Process the voice command
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
      this.makeMove(moveIndex); // Make the move based on voice command
    } else if (
      ['novo jogo', 'recomeçar', 'jogar novamente'].includes(command.toLowerCase())
    ) {
      this.newGame(); // Start a new game based on voice command
    } else {
      console.log('Command not recognized:', command); // Log unrecognized command
    }
  }
}
