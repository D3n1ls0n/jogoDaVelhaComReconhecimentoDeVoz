import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  currentStep: number = 0; // Track the current step in the voice recognition process
  isRecognitionActive: boolean = false;

  constructor() {}

  submitNames() {
    this.startGame.emit({
      player1: this.player1Name,
      player2: this.player2Name,
    });
  }



  // DEVE SER ALTERADO AQUI ..................................................................................................

  setupVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'pt-BR';

      let step = 0; // Step counter to track the stage of input (0: player 1 name, 1: player 1 piece, 2: player 2 name)

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim();

        if (step === 0) {
          this.player1Name = transcript;
          step++;
          console.log('Nome do jogador 1:', this.player1Name);
          console.log('Por favor, escolha sua peça, Jogador 1 (UM ou DOIS).');
          this.recognition.stop();
          setTimeout(() => {
            this.recognition.start();
          }, 1000);
        } else if (step === 1) {
          if (transcript.toLowerCase() === 'um' || transcript.toLowerCase() === 'dois') {
            this.player1Piece = transcript.toLowerCase() === 'um' ? 'X' : 'O';
            console.log(`Jogador 1 escolheu ${this.player1Piece === 'X' ? 'UM (X)' : 'DOIS (O)'}.`);
            this.player2Piece = this.player1Piece === 'X' ? 'O' : 'X'; // Peça restante para o jogador 2
            step++;
            console.log('Por favor, diga o nome do Jogador 2.');
            this.recognition.stop();
            setTimeout(() => {
              this.recognition.start();
            }, 1000);
          } else {
            console.log('Escolha inválida. Por favor, escolha UM ou DOIS.');
          }
        } else if (step === 2) {
          this.player2Name = transcript;
          console.log('Nome do jogador 2:', this.player2Name);
          console.log(`Jogador 2 ficará com a peça ${this.player2Piece === 'X' ? 'UM (X)' : 'DOIS (O)'}.`);
          this.recognition.stop();
          this.submitNames(); // Certifique-se de que a função submitNames é chamada aqui
        }
      };

      console.log('Por favor, diga o nome do Jogador 1.');
      this.recognition.start();
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.');
    }
  }



}
