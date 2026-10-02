import { useEffect, useRef, useSyncExternalStore } from 'react';
import { VoiceAssistantOrchestrator } from './voiceAssistantOrchestrator';

export function useVoiceAssistant() {
  const orchestratorRef = useRef<VoiceAssistantOrchestrator | null>(null);
  if (!orchestratorRef.current) {
    orchestratorRef.current = new VoiceAssistantOrchestrator();
  }
  const orchestrator = orchestratorRef.current;

  const snapshot = useSyncExternalStore(orchestrator.subscribe, orchestrator.getSnapshot);

  useEffect(() => {
    return () => orchestrator.close();
  }, [orchestrator]);

  return {
    ...snapshot,
    startTalking: () => orchestrator.startTalking(),
    stopTalking: () => orchestrator.stopTalking(),
    close: () => orchestrator.close(),
  };
}
