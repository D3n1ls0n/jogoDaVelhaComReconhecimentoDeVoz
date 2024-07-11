import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareComponent } from '../square/square.component';
import { NomeParticipantesComponent } from '../nome-participantes/nome-participantes.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  player1TicketNumber: string | null = null;
  player2TicketNumber: string | null = null;
  countdown: number = 0;
  public player2Name_: any;
  public playerId1: any;
  public playerId2: any;



  showCountdown = true;
  showStartMessage = false;
  isMachinePlaying = false;
  records: { name: string; wins: number }[] = [];
  startTime: number | null = null;
  elapsedTime: number = 0;
  dataActual: any;
  public theBestRecords: any;

  constructor(
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.newGame();
  }

  startGame(event: { player1: string; player2: string }) {
    this.player1 = event.player1;
    this.player2 = event.player2;
  }

  getAllPlayers() {
    this.http
      .get('http://localhost:3000/getAllPlayers')
      .subscribe((response: any) => {
        // Inicializa arrays para armazenar nomes e bilhetes
        const nomes: string[] = [];
        const bilhetes: string[] = [];

        // Itera sobre a resposta e armazena os valores nos arrays
        response.forEach((element: any) => {
          /* nomes.push(element.Nome); */
          bilhetes.push(element.bi);
        });

        if (this.player2Name_ != 'Máquina') {
          // Verifica se player1Name e player1TicketNumber não são null
          const player1Valid =
            this.player1Name !== null && this.player1TicketNumber !== null;
          // Verifica se player2Name e player2TicketNumber não são null
          const player2Valid =
            this.player2Name !== null && this.player2TicketNumber !== null;

          if (player1Valid && player2Valid) {
            // Verifica se existe um nome e bi igual ao dos jogadores que vieram pela rota
            const player1Exists =
              /*  nomes.includes(this.player1Name as string); */
              bilhetes.includes(this.player1TicketNumber as string);
            const player2Exists =
              /* nomes.includes(this.player2Name_ as string); */
              bilhetes.includes(this.player2TicketNumber as string);

            if (!player1Exists) {
              this.registerPlayer(
                this.player1Name as string,
                this.player1TicketNumber as string
              );
            }
            if (!player2Exists)
              this.registerPlayer(
                this.player2Name as string,
                this.player2TicketNumber as string
              );
          } else {
            console.log('Os nomes e/ou bilhetes dos jogadores são inválidos.');
          }
        } else {
          // Verifica se player1Name e player1TicketNumber não são null
          const player1Valid =
            this.player1Name !== null && this.player1TicketNumber !== null;
          if (player1Valid) {
            const player1Exists = bilhetes.includes(
              this.player1TicketNumber as string
            );

            if (player1Exists) {
            } else {
              this.registerPlayer(
                this.player1Name as string,
                this.player1TicketNumber as string
              );
            }
          }
        }
      });
  }

  getPlayerByNameAndTicket(nome: any, bi: any, playerIndex: number) {
    const playerData = { Nome: nome, bi: bi };
    this.http
      .post('http://localhost:3000/find-player-by-data', playerData)
      .subscribe((response: any) => {
        if (playerIndex === 1) {
          this.playerId1 = response.ID;
        } else if (playerIndex === 2) {
          this.playerId2 = response.ID;
        }
      });
  }

  registerPlayer(player: any, ticket: any) {
    const playerData = { Nome: player, bi: ticket };
    this.http
      .post('http://localhost:3000/player', playerData)
      .subscribe((response: any) => {
        const playerId = response.insertId; // Obtém o ID inserido, esse ID vai ser usado quando o jogo terminar (vai servir para a tabela Records)
      });
  }

  listTheBestRecords() {
    //Trás os três melhores records
    this.http
      .get('http://localhost:3000/getBestRecords')
      .subscribe((response: any) => {
        this.theBestRecords = response;
        console.log(this.theBestRecords);
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.player1Name = params['player1'];
      this.player1Piece = params['player1Piece'];
      this.player2Name = params['player2'];
      this.player2Piece = params['player2Piece'];
      this.player1TicketNumber = params['player1TicketNumber'];
      this.player2TicketNumber = params['player2TicketNumber'];

      if (this.player2Name === 'Máquina') {
        this.isMachinePlaying = true;
      }
    });
    this.startCountdown();
    this.loadRecords();
    this.newGame();
    this.setupVoiceRecognition();
    this.player2Name_ = this.player2Name;
    this.getAllPlayers();
    this.listTheBestRecords();
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

        // Iniciar cronômetro
        this.resetTimer();
      }
    }, 1000);
  }

  resetTimer() {
    this.startTime = Date.now();
    this.elapsedTime = 0;
    const isoString = new Date().toISOString();
    this.dataActual = `${isoString.slice(0, 10)} ${isoString.slice(11, 19)}`;
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
    // Reiniciar cronômetro
    this.resetTimer();
    this.listTheBestRecords();
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
        this.saveWinner(
          winnerData.winner === 'X' ? this.player1Name : this.player2Name
        );
        return; // Exit if there's a winner
      } else if (this.noOneWonTheGame()) {
        this.winner = 'Empate';
        this.saveInRecordTable(this.winner);
        return; // Exit if there's a draw
      }

      // Check if it's the machine's turn right after the human player's move
      if (this.isMachinePlaying && !this.xIsNext && !this.winner) {
        setTimeout(() => {
          this.announceMachineMove();
        }, 500); // Delay the machine's move
      }
    } else {
      this.speak(
        'Essa posição já está ocupada. Por favor, escolha outra posição.'
      );
    }
  }

  announceMachineMove() {
    const emptySquares = this.squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomIndex =
      emptySquares[Math.floor(Math.random() * emptySquares.length)];
    if (randomIndex !== null && randomIndex !== undefined) {
      /*  const moveCommands = [
        'um',
        'dois',
        'três',
        'quatro',
        'cinco',
        'seis',
        'sete',
        'oito',
        'nove',
      ]; */
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
      const moveCommand = moveCommands[randomIndex];
      this.speak(`A máquina irá jogar na posição ${moveCommand}.`);
      setTimeout(() => {
        this.makeMove(randomIndex);
      }, 2000); // Delay the machine's move
    }
  }

  makeMachineMove() {
    const emptySquares = this.squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomIndex =
      emptySquares[Math.floor(Math.random() * emptySquares.length)];
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

  saveWinner(winnerName: string | null) {
    if (!winnerName) return;
    // Parar o cronômetro
    if (this.startTime !== null) {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }

    const record = this.records.find((record) => record.name === winnerName);

    if (record) {
      record.wins += 1;
    } else {
      this.records.push({ name: winnerName, wins: 1 });
    }
    //this.saveRecords();

    this.saveInRecordTable(winnerName);

    // Anunciar o vencedor e perguntar se deseja continuar jogando
    if (winnerName) {
      this.speak(
        `Parabéns, ${winnerName}! Você venceu o jogo. Deseja continuar jogando?`
      );
    } else {
      this.speak('O jogo terminou em empate. Deseja continuar jogando?');
    }
  }

  saveInRecordTable(winnerName: any) {
    this.getPlayerByNameAndTicket(
      this.player1Name,
      this.player1TicketNumber,
      1
    );

    this.getPlayerByNameAndTicket(
      this.player2Name,
      this.player2TicketNumber,
      2
    );

    setTimeout(() => {
      /* if (!winnerName) {

      } else { }*/
      if (winnerName === this.player1Name) {
        const playerData = {
          JogadorID: this.playerId1,
          DataJogo: this.dataActual,
          Resultado: 'Vitória',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );

        const playerData2 = {
          JogadorID: this.playerId2,
          DataJogo: this.dataActual,
          Resultado: 'Derrota',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData2).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );
      } else if (winnerName === this.player2Name) {
        const playerData = {
          JogadorID: this.playerId2,
          DataJogo: this.dataActual,
          Resultado: 'Vitória',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );

        const playerData1 = {
          JogadorID: this.playerId1,
          DataJogo: this.dataActual,
          Resultado: 'Derrota',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData1).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );
      } else {
        if (this.startTime !== null) {
          this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        const playerData = {
          JogadorID: this.playerId2,
          DataJogo: this.dataActual,
          Resultado: 'Empate',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );

        const playerData1 = {
          JogadorID: this.playerId1,
          DataJogo: this.dataActual,
          Resultado: 'Empate',
          TempoJogo: this.elapsedTime,
        };

        this.http.post('http://localhost:3000/record', playerData1).subscribe(
          (response: any) => {},
          (error: any) => {
            console.error('Erro:', error);
          }
        );
      }
      // Reiniciar cronômetro
      this.resetTimer();
    }, 500);
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
    /* const moveCommands = [
      'um',
      'dois',
      'três',
      'quatro',
      'cinco',
      'seis',
      'sete',
      'oito',
      'nove',
    ]; */
    const moveIndex = moveCommands.indexOf(command.toLowerCase());

    if (moveIndex > -1) {
      this.makeMove(moveIndex);
    } else if (
      ['novo jogo', 'recomeçar', 'jogar novamente', 'sim'].includes(
        command.toLowerCase()
      )
    ) {
      this.newGame();
    } else if ('voltar'.includes(command.toLowerCase())) {
      this.router.navigate(['/']);
    } else {
      console.log('Command not recognized:', command);
    }
  }

  speak(message: string) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  }
}
