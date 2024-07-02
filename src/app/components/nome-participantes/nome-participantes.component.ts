import { Component, EventEmitter, Output, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nome-participantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nome-participantes.component.html',
  styleUrls: ['./nome-participantes.component.scss'],
})
export class NomeParticipantesComponent {
  @Output() startGame = new EventEmitter<{
    player1: string;
    player2: string;
  }>(); // Emite evento para iniciar o jogo

  recognition: any; // Instância do reconhecimento de voz
  player1Name: string = ''; // Nome do jogador 1
  player2Name: string = ''; // Nome do jogador 2
  player1Piece: string = ''; // Peça do jogador 1
  player2Piece: string = ''; // Peça do jogador 2
  decision: string = ''; // Decisão do jogador
  player1TicketNumber: string = ''; //Número do BI do jogador 1
  player2TicketNumber: string = ''; //Número do BI do jogador 2
  public currentStep: number = 0; // Rastreamento da etapa atual no processo de reconhecimento de voz
  isRecognitionActive: boolean = false; // Indica se o reconhecimento de voz está ativo
  playingAgainstMachine: boolean = false; // Indica se o jogador está jogando contra a máquina

  constructor(private router: Router, private ngZone: NgZone) {}

  submitNames() {
    // Emite os nomes dos jogadores e redireciona para o componente do tabuleiro com parâmetros da URL
    this.startGame.emit({
      player1: this.player1Name,
      player2: this.player2Name,
    });

    this.ngZone.run(() => {
      this.router.navigate(['/board'], {
        queryParams: {
          player1: this.player1Name,
          player1Piece: this.player1Piece,
          player2: this.player2Name,
          player2Piece: this.player2Piece,
          player1TicketNumber: this.player1TicketNumber,
          player2TicketNumber: this.player2TicketNumber
        },
      });
    });
  }

  testRout() {
    this.router.navigate(['/board']); // Redireciona para o componente do tabuleiro (para testes)
  }

  speak(message: string) {
    // Utiliza a síntese de voz para falar uma mensagem
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  }

  setupVoiceRecognition() {
    // Configura o reconhecimento de voz
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (SpeechRecognition && synth) {
      console.log('AQUI');

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'pt-BR';

      this.recognition.onstart = () => {
        // Indica que o reconhecimento de voz está ativo
        this.ngZone.run(() => {
          this.isRecognitionActive = true;
        });
      };

      let step = 0; // Contador para rastrear a etapa do processo de entrada de dados
      this.currentStep = step;

      const speak = (text: string) => {
        // Utiliza a síntese de voz para falar uma mensagem e iniciar o reconhecimento de voz após a fala
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = 'pt-BR';
        utterThis.onend = () => {
          this.recognition.start();
        };
        synth.speak(utterThis);
      };

      const promptUser = (text: string) => {
        console.log(text);

        // Interrompe o reconhecimento de voz e fala uma mensagem ao usuário
        this.recognition.stop();
        setTimeout(() => {
          speak(text);
        }, 500);
      };

      this.recognition.onresult = (event: any) => {
        // Lida com o resultado do reconhecimento de voz
        const transcript =
          event.results[event.resultIndex][0].transcript.trim();

        if (step === 0) {
          // Etapa de decidir se o jogo será contra a máquina
          if (transcript.toLowerCase() === 'sim') {
            this.playingAgainstMachine = true;
            step++;
            this.currentStep = step;
            promptUser('Por favor, diga o seu nome.');
          } else if (transcript.toLowerCase() === 'não') {
            this.playingAgainstMachine = false;
            step = 2; // Avança para o passo de nome do Jogador 1
            this.currentStep = step;
            promptUser('Por favor, diga o nome do Jogador 1.');
          } else {
            promptUser('Escolha inválida. Por favor, diga SIM ou NÃO.');
          }
        } else if (step === 1 && this.playingAgainstMachine) {
          // Etapa de captura do nome do Jogador 1
          this.player1Name = transcript;
          step++;
          this.currentStep = step;
          promptUser('Por favor, diga o seu número de bilhete.');
        } else if (step === 2 && this.playingAgainstMachine) {
          // Etapa de captura do número de bilhete do Jogador 1
          this.player1TicketNumber = transcript;
          step++;
          this.currentStep = step;
          promptUser('Por favor, escolha sua peça (UM ou DOIS).');
        } else if (step === 3 && this.playingAgainstMachine) {
          // Etapa de escolha da peça pelo Jogador 1
          if (
            transcript.toLowerCase() === 'peça 1' ||
            transcript.toLowerCase() === '1' ||
            transcript.toLowerCase() === 'peça 2' ||
            transcript.toLowerCase() === '2'
          ) {
            this.player1Piece =
              transcript.toLowerCase() === 'peça 1' ? 'X' : 'O';
            this.player2Name = 'Máquina';
            this.player2Piece = this.player1Piece === 'X' ? 'O' : 'X';
            step++;
            this.currentStep = step;
            promptUser('Gostaria de iniciar o jogo? Diga SIM para começar.');
          } else {
            promptUser('Escolha inválida. Por favor, escolha UM ou DOIS.');
          }
        } else if (step === 4 && this.playingAgainstMachine) {
          // Etapa de confirmação para iniciar o jogo
          this.decision = transcript.toLowerCase();
          if (this.decision === 'sim') {
            this.recognition.stop();
            this.submitNames(); // Chama a função submitNames para iniciar o jogo
          } else {
            promptUser('Jogo não iniciado. Por favor, diga SIM para começar.');
          }
        } else if (step === 2 && !this.playingAgainstMachine) {
          // Etapa de captura do nome do Jogador 1
          this.player1Name = transcript;
          step++;
          this.currentStep = step;
          promptUser('Por favor, escolha sua peça, Jogador 1 (UM ou DOIS).');
        } else if (step === 3 && !this.playingAgainstMachine) {
          // Etapa de escolha da peça pelo Jogador 1
          if (
            transcript.toLowerCase() === 'peça 1' ||
            transcript.toLowerCase() === '1' ||
            transcript.toLowerCase() === 'peça 2' ||
            transcript.toLowerCase() === '2'
          ) {
            this.player1Piece =
              transcript.toLowerCase() === 'peça 1' ? 'X' : 'O';
            this.player2Piece = this.player1Piece === 'X' ? 'O' : 'X';
            step++;
            this.currentStep = step;
            promptUser('Por favor, diga o seu número de bilhete.');
          } else {
            promptUser('Escolha inválida. Por favor, escolha UM ou DOIS.');
          }
        } else if (step === 4 && !this.playingAgainstMachine) {
          // Etapa de captura do número de bilhete do Jogador 1
          this.player1TicketNumber = transcript;
          step++;
          this.currentStep = step;
          promptUser('Por favor, diga o nome do Jogador 2.');
        } else if (step === 5 && !this.playingAgainstMachine) {
          // Etapa de captura do nome do Jogador 2
          this.player2Name = transcript;
          step++;
          this.currentStep = step;
          promptUser('Por favor, diga o número de bilhete do Jogador 2.');
        } else if (step === 6 && !this.playingAgainstMachine) {
          // Etapa de captura do número de bilhete do Jogador 2
          this.player2TicketNumber = transcript;
          step++;
          this.currentStep = step;
          promptUser(
            `Jogador 2 ficará com a peça ${
              this.player2Piece === 'X' ? 'UM (X)' : 'DOIS (O)'
            }. Gostaria de iniciar o jogo? Diga SIM para começar.`
          );
        } else if (step === 7 && !this.playingAgainstMachine) {
          // Etapa de confirmação para iniciar o jogo
          this.decision = transcript.toLowerCase();
          if (this.decision === 'sim') {
            this.recognition.stop();
            this.submitNames(); // Chama a função submitNames para iniciar o jogo
          } else {
            promptUser('Jogo não iniciado. Por favor, diga SIM para começar.');
          }
        }
      };

      console.log(1);
      promptUser('Gostaria de jogar contra a máquina? (SIM ou NÃO)'); // Primeira pergunta ao usuário
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.'); // Alerta se o navegador não suportar reconhecimento de voz
    }
  }

  ngOnInit() {
    this.setupVoiceRecognition(); // Inicia o reconhecimento de voz quando o componente é carregado
  }
}
