import { useState, useEffect, useRef } from 'react';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';
import { useEntries } from '../../hooks/useEntries';
import { processTranscript } from '../../agent/processor';

const BAR_DELAYS = ['0s', '0.18s', '0.09s', '0.27s', '0.14s'];

export default function Capture() {
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript, error: voiceError } = useVoiceCapture();
  const { addEntry } = useEntries();
  const [processing, setProcessing] = useState(false);
  const spaceDownRef = useRef(false);

  const animDuration = isRecording ? '2.8s' : '5.5s';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        if (!spaceDownRef.current && !processing) {
          spaceDownRef.current = true;
          startRecording();
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (spaceDownRef.current) {
          spaceDownRef.current = false;
          handleStop();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [processing, startRecording]);

  async function handleStop() {
    if (!isRecording) return;
    setProcessing(true);
    try {
      const text = await stopRecording();
      if (!text.trim()) return;
      const result = await processTranscript(text);
      await addEntry({
        raw_transcript: text,
        summary: result.summary,
        action_type: result.action_type,
        next_action: result.next_action,
      });
      clearTranscript();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      onMouseDown={startRecording}
      onMouseUp={handleStop}
      onTouchStart={startRecording}
      onTouchEnd={handleStop}
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        background: '#060606',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Outer glow */}
      <div style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        width: 340,
        height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(238,234,222,0.22) 0%, rgba(200,196,186,0.08) 45%, transparent 68%)',
        filter: 'blur(40px)',
        '--breath-lo': isRecording ? '0.55' : '0.38',
        '--breath-hi': isRecording ? '0.85' : '0.55',
        animation: `${isRecording ? 'breatheFast' : 'breathe'} ${animDuration} ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      {/* Mid glow */}
      <div style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,248,238,0.28) 0%, transparent 75%)',
        filter: 'blur(22px)',
        '--breath-lo': isRecording ? '0.40' : '0.22',
        '--breath-hi': isRecording ? '0.65' : '0.38',
        animation: `${isRecording ? 'breatheFast' : 'breathe'} ${animDuration} ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      {/* Core glow */}
      <div style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,253,246,0.5) 0%, transparent 80%)',
        filter: 'blur(8px)',
        '--breath-lo': isRecording ? '0.50' : '0.35',
        '--breath-hi': isRecording ? '0.80' : '0.55',
        animation: `${isRecording ? 'breatheFast' : 'breathe'} ${animDuration} ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      {/* Waveform bars — visible only while recording */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          pointerEvents: 'none',
        }}>
          {BAR_DELAYS.map((delay, i) => (
            <div key={i} style={{
              width: 2.5,
              height: 18,
              borderRadius: 2,
              background: 'rgba(255,252,245,0.85)',
              transformOrigin: 'center',
              animation: `barBounce ${0.55 + i * 0.07}s ease-in-out ${delay} infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Text area below glow */}
      <div style={{
        position: 'absolute',
        top: 'calc(42% + 120px)',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '0 32px',
        pointerEvents: 'none',
      }}>
        {voiceError && voiceError !== 'not supported' && !isRecording && !processing && (
          <span style={{
            fontSize: 13,
            fontWeight: 300,
            color: 'rgba(255,100,100,0.7)',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            {voiceError}
          </span>
        )}
        {!isRecording && !processing && !transcript && !voiceError && (
          <span style={{
            fontSize: 14,
            fontWeight: 300,
            color: 'rgba(248,244,234,0.28)',
            animation: `breathe ${animDuration} ease-in-out infinite`,
            '--breath-lo': '0.22',
            '--breath-hi': '0.35',
            letterSpacing: '-0.01em',
          }}>
            {voiceError === 'not supported' ? 'voice not supported in this browser' : "what's on your mind"}
          </span>
        )}

        {(isRecording || transcript) && !processing && (
          <span style={{
            fontSize: 15,
            fontWeight: 300,
            color: 'rgba(255,252,242,0.6)',
            textAlign: 'center',
            lineHeight: 1.5,
            animation: 'fadeUp 0.25s ease forwards',
          }}>
            {transcript}
            <span style={{
              display: 'inline-block',
              width: 1.5,
              height: '1em',
              background: 'rgba(255,252,242,0.5)',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'cursorBlink 1s step-end infinite',
            }} />
          </span>
        )}

        {processing && (
          <>
            <span style={{
              fontSize: 15,
              fontWeight: 300,
              color: 'rgba(255,252,242,0.35)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              {transcript}
            </span>
            <span style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.15em',
              textTransform: 'lowercase',
            }}>
              processing
            </span>
          </>
        )}
      </div>
    </div>
  );
}
