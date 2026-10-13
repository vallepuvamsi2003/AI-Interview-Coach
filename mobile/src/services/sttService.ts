/**
 * Mobile Speech-to-Text & Audio Recording Adapter
 * Integrates Expo AV audio recording and speech recognition bridging
 */
import { Audio } from 'expo-av';

export class MobileSTTService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  public async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  public async startRecording(onStatusUpdate?: (status: any) => void): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission was denied.');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    if (onStatusUpdate) {
      recording.setOnRecordingStatusUpdate(onStatusUpdate);
    }
    await recording.startAsync();
    this.recording = recording;
    this.isRecording = true;
  }

  public async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;
    this.isRecording = false;
    return uri;
  }
}

export const mobileSTT = new MobileSTTService();
