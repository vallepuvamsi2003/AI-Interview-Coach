/**
 * Mobile Text-to-Speech Service using Expo Speech
 */
import * as Speech from 'expo-speech';

export class MobileTTSService {
  public speak(text: string, onDone?: () => void) {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => {
        if (onDone) onDone();
      },
      onError: () => {
        if (onDone) onDone();
      },
    });
  }

  public stop() {
    Speech.stop();
  }
}

export const mobileTTS = new MobileTTSService();
