import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (data: string | ArrayBuffer | Blob) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket({
  url,
  enabled = true,
  onMessage,
  onError,
  onClose,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      onMessage?.(event);
    };

    ws.onerror = (event) => {
      onError?.(event);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      onClose?.(event);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval);
      }
    };

    wsRef.current = ws;
  }, [url, enabled, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback(
    (data: string | ArrayBuffer | Blob) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    },
    []
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, sendMessage, disconnect, reconnect };
}
