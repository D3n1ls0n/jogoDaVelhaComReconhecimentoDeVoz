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
  }>();

  recognition: any;
  player1Name: string = '';
  player2Name: string = '';
  player1Piece: string = '';
  player2Piece: string = '';
  decision: string = '';
  public currentStep: number = 0; // Track the current step in the voice recognition process
  isRecognitionActive: boolean = false;
  playingAgainstMachine: boolean = false;
  constructor(private router: Router, private ngZone: NgZone) {}

  submitNames() {
    this.startGame.emit({
      player1: this.player1Name,
      player2: this.player2Name,
    });

    // Redirect to the board component with query parameters
    this.ngZone.run(() => {
      this.router.navigate(['/board'], {
        queryParams: {
          player1: this.player1Name,
          player1Piece: this.player1Piece,
          player2: this.player2Name,
          player2Piece: this.player2Piece,
        },
      });
    });
  }

  testRout() {
    this.router.navigate(['/board']);
  }

  // DEVE SER ALTERADO AQUI ..................................................................................................

  speak(message: string) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  }

  setupVoiceRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const synth = window.speechSynthesis;
    if (SpeechRecognition && synth) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'pt-BR';

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isRecognitionActive = true; // Para controlar o front
        });
      };

      let step = 0; // Step counter to track the stage of input
      this.currentStep = step;
      console.log('this.currentStep', this.currentStep);

      const speak = (text: string) => {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = 'pt-BR';
        utterThis.onend = () => {
          this.recognition.start();
        };
        synth.speak(utterThis);
      };

      const promptUser = (text: string) => {
        this.recognition.stop();
        setTimeout(() => {
          speak(text);
        }, 500);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim();

        if (step === 0) {
          if (transcript.toLowerCase() === 'sim') {
            this.playingAgainstMachine = true;
            step++;
            this.currentStep = step;
            console.log('this.currentStep', this.currentStep);

            promptUser('Por favor, diga o seu nome.');
          } else if (transcript.toLowerCase() === 'não') {
            this.playingAgainstMachine = false;
            step = 2; // Avança para o passo de nome do Jogador 1
            this.currentStep = step;
            console.log('this.currentStep', this.currentStep);

            promptUser('Por favor, diga o nome do Jogador 1.');
          } else {
            promptUser('Escolha inválida. Por favor, diga SIM ou NÃO.');
          }
        } else if (step === 1 && this.playingAgainstMachine) {
          this.player1Name = transcript;
          step++;
          this.currentStep = step;
          console.log('this.currentStep', this.currentStep);

          promptUser('Por favor, escolha sua peça (UM ou DOIS).');
        } else if (step === 2 && this.playingAgainstMachine) {
          if (transcript.toLowerCase() === 'peça 1' || transcript.toLowerCase() === '1' || transcript.toLowerCase() === 'peça 2' || transcript.toLowerCase() === '2') {
            this.player1Piece = transcript.toLowerCase() === 'peça 1' ? 'X' : 'O';
            this.player2Name = 'Máquina';
            this.player2Piece = this.player1Piece === 'X' ? 'O' : 'X';

            console.log(`Você escolheu a peça ${this.player1Piece}.`);
            console.log('A Máquina ficará com a peça', this.player2Piece);
            step++;
            this.currentStep = step;

            promptUser('Gostaria de iniciar o jogo? Diga SIM para começar.');
          } else {
            promptUser('Escolha inválida. Por favor, escolha UM ou DOIS.');
          }
        } else if (step === 3 && this.playingAgainstMachine) {
          this.decision = transcript.toLowerCase();
          if (this.decision === 'sim') {
            this.recognition.stop();
            this.submitNames(); // Certifique-se de que a função submitNames é chamada aqui
          } else {
            promptUser('Jogo não iniciado. Por favor, diga SIM para começar.');
          }
        } else if (step === 2 && !this.playingAgainstMachine) {
          this.player1Name = transcript;
          step++;
          this.currentStep = step;
          console.log('this.currentStep', this.currentStep);

          promptUser('Por favor, escolha sua peça, Jogador 1 (UM ou DOIS).');
        } else if (step === 3 && !this.playingAgainstMachine) {
          if (transcript.toLowerCase() === 'peça 1' || transcript.toLowerCase() === '1' || transcript.toLowerCase() === 'peça 2' || transcript.toLowerCase() === '2') {
            this.player1Piece = transcript.toLowerCase() === 'peça 1' ? 'X' : 'O';
            this.player2Piece = this.player1Piece === 'X' ? 'O' : 'X';
            step++;
            this.currentStep = step;
            console.log('this.currentStep', this.currentStep);

            promptUser('Por favor, diga o nome do Jogador 2.');
          } else {
            promptUser('Escolha inválida. Por favor, escolha UM ou DOIS.');
          }
        } else if (step === 4 && !this.playingAgainstMachine) {
          this.player2Name = transcript;
          step++;
          this.currentStep = step;
          console.log('this.currentStep', this.currentStep);

          promptUser(`Jogador 2 ficará com a peça ${this.player2Piece === 'X' ? 'UM (X)' : 'DOIS (O)'}. Gostaria de iniciar o jogo? Diga SIM para começar.`);
        } else if (step === 5 && !this.playingAgainstMachine) {
          this.decision = transcript.toLowerCase();
          if (this.decision === 'sim') {
            this.recognition.stop();
            this.submitNames(); // Certifique-se de que a função submitNames é chamada aqui
          } else {
            promptUser('Jogo não iniciado. Por favor, diga SIM para começar.');
          }
        }
      };

      promptUser('Gostaria de jogar contra a máquina? (SIM ou NÃO)');
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.');
    }
  }


}
