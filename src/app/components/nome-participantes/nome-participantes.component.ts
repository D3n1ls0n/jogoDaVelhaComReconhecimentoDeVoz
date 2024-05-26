import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-nome-participantes',
  standalone: true,
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

  constructor() {}

  submitNames() {
    this.startGame.emit({
      player1: this.player1Name,
      player2: this.player2Name,
    });
  }

  setupVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'pt-BR';

      let askingForPlayer1Name = true;

      this.recognition.onresult = (event: any) => {
        const transcript =
          event.results[event.resultIndex][0].transcript.trim();
        if (askingForPlayer1Name) {
          this.player1Name = transcript;
          askingForPlayer1Name = false;
          console.log('Nome do jogador 1:', this.player1Name);
          console.log('Por favor, diga o nome do Jogador 2.');
          // Reiniciar reconhecimento de voz para solicitar o nome do jogador 2
          this.recognition.stop();
          setTimeout(() => {
            this.recognition.start();
          }, 1000);
        } else {
          this.player2Name = transcript;
          console.log('Nome do jogador 2:', this.player2Name);
          this.submitNames();
          // Finalizar o reconhecimento de voz após obter o nome do jogador 2
          this.recognition.stop();
        }
      };

      console.log('Por favor, diga o nome do Jogador 1.');
      this.recognition.start();
    } else {
      alert('Seu navegador não suporta reconhecimento de fala.');
    }
  }


}
