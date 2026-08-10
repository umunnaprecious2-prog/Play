// Tiny pub/sub the shared apiFetch() wrapper uses to signal "this request is
// taking a while" -- almost always Render's free-tier backend waking up from
// an idle spin-down, not a real failure. ColdStartBanner subscribes to this
// to show a friendly "waking up" message instead of the app just looking
// stuck or broken for up to a minute.
type Listener = (isWaking: boolean) => void;

const listeners = new Set<Listener>();
let activeSlowRequests = 0;

export function subscribeColdStart(listener: Listener): () => void {
  listeners.add(listener);
  listener(activeSlowRequests > 0);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  const isWaking = activeSlowRequests > 0;
  listeners.forEach((listener) => listener(isWaking));
}

export function markSlowRequestStarted() {
  activeSlowRequests += 1;
  notify();
}

export function markSlowRequestEnded() {
  activeSlowRequests = Math.max(0, activeSlowRequests - 1);
  notify();
}
