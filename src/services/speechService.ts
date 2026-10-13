/**
 * SPEECH SERVICE
 * Provides browser Web Speech API Speech-to-Text (webkitSpeechRecognition / SpeechRecognition)
 * and SpeechSynthesis Text-to-Speech for realistic voice interviews.
 */

// Define SpeechRecognition interface for browser support
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (this.onTranscriptCallback) {
            const combined = finalTranscript || interimTranscript;
            this.onTranscriptCallback(combined, Boolean(finalTranscript));
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (this.onErrorCallback) {
            let msg = 'Speech recognition error.';
            if (event.error === 'not-allowed') msg = 'Microphone permission denied. Please allow microphone access.';
            if (event.error === 'no-speech') msg = 'No speech was detected. Please try speaking again.';
            if (event.error === 'network') msg = 'Network error during speech recognition.';
            this.onErrorCallback(msg);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      console.warn('Failed to start recognition:', e);
      if (onError) onError(e.message || 'Could not start microphone recording.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  // Text-to-Speech (TTS)
  public speak(text: string, onDone?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onDone) onDone();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      if (onDone) onDone();
    };

    utterance.onerror = () => {
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
