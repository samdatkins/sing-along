import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

interface UseSongbookWebSocketOptions<T> {
  sessionKey: string | undefined;
  onMessage: (data: T) => void;
}

export function useSongbookWebSocket<T>({
  sessionKey,
  onMessage,
}: UseSongbookWebSocketOptions<T>): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!sessionKey) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // In development, CRA's proxy doesn't forward WebSocket upgrades reliably,
    // so connect directly to the backend server.
    const host =
      process.env.NODE_ENV === "development"
        ? "localhost:8080"
        : window.location.host;
    const url = `${protocol}//${host}/ws/songbook/${sessionKey}/`;

    const ws = new ReconnectingWebSocket(url, [], {
      maxRetries: 20,
      connectionTimeout: 4000,
    });
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessageRef.current(data);
      } catch {
        // ignore malformed messages
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "sync" }));
        } else {
          ws.reconnect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      ws.close();
      wsRef.current = null;
    };
  }, [sessionKey]);

  return { isConnected };
}
