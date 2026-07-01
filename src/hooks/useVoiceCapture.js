import { useState, useRef } from 'react';

export function useVoiceCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setTranscript('');
      setError(null);
      console.log('[voice] requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      console.log('[voice] mimeType:', mimeType || '(browser default)');
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('[voice] chunk:', e.data.size, 'bytes');
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      console.log('[voice] recording started, state:', mediaRecorder.state);
      setIsRecording(true);
    } catch (err) {
      console.error('[voice] startRecording error:', err);
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) { console.warn('[voice] no mediaRecorder'); return resolve(''); }

      console.log('[voice] stopping, state:', mediaRecorder.state, 'chunks so far:', chunksRef.current.length);

      mediaRecorder.onstop = async () => {
        console.log('[voice] stopped, total chunks:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        console.log('[voice] blob size:', blob.size, 'type:', blob.type);
        const text = await transcribeWithWhisper(blob);
        setTranscript(text);
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        resolve(text);
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });
  };

  const transcribeWithWhisper = async (audioBlob) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('[voice] API key present:', !!apiKey, 'blob size:', audioBlob.size);
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      console.log('[voice] calling Whisper API...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      console.log('[voice] Whisper response status:', response.status);
      const data = await response.json();
      console.log('[voice] Whisper response data:', data);
      if (!response.ok) {
        const msg = data?.error?.code === 'insufficient_quota'
          ? 'OpenAI quota exceeded — check billing'
          : `API error ${response.status}: ${data?.error?.message || 'unknown'}`;
        setError(msg);
        return '';
      }
      return data.text || '';
    } catch (err) {
      console.error('[voice] transcription error:', err);
      setError('Transcription failed');
      return '';
    }
  };

  const clearTranscript = () => setTranscript('');

  return { isRecording, transcript, startRecording, stopRecording, clearTranscript, error };
}
