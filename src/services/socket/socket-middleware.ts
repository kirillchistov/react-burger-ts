import type {
  ActionCreatorWithoutPayload,
  Dispatch,
  Middleware,
  PayloadActionCreator,
  UnknownAction,
} from '@reduxjs/toolkit';

export const SOCKET_RECONNECT_DELAY = 3000;

type TSocketMiddlewareOptions = {
  closed: ActionCreatorWithoutPayload;
  connect: ActionCreatorWithoutPayload;
  disconnect: ActionCreatorWithoutPayload;
  failed: PayloadActionCreator<string>;
  failureMessage: string;
  getUrl: () => string | null;
  onMessage: (data: unknown, dispatch: Dispatch<UnknownAction>) => void;
};

const readSocketData = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    return JSON.parse(data) as unknown;
  } catch {
    return null;
  }
};

export const createSocketMiddleware =
  (options: TSocketMiddlewareOptions): Middleware =>
  (storeApi) => {
    let socket: WebSocket | null = null;
    let reconnectTimer = 0;
    let shouldReconnect = false;

    const closeSocket = (): void => {
      window.clearTimeout(reconnectTimer);
      const activeSocket = socket;
      socket = null;
      activeSocket?.close();
    };

    const openSocket = (): void => {
      const url = options.getUrl();

      if (!url) {
        shouldReconnect = false;
        storeApi.dispatch(options.failed(options.failureMessage));
        return;
      }

      closeSocket();
      const nextSocket = new WebSocket(url);
      socket = nextSocket;

      nextSocket.onmessage = (event: MessageEvent<string>): void => {
        const data = readSocketData(event.data);

        if (data !== null) {
          options.onMessage(data, storeApi.dispatch);
        }
      };

      nextSocket.onerror = (): void => {
        storeApi.dispatch(options.failed(options.failureMessage));
      };

      nextSocket.onclose = (): void => {
        if (socket !== nextSocket || !shouldReconnect) {
          return;
        }

        socket = null;
        storeApi.dispatch(options.closed());
        reconnectTimer = window.setTimeout(() => {
          storeApi.dispatch(options.connect());
        }, SOCKET_RECONNECT_DELAY);
      };
    };

    return (next) =>
      (action: unknown): unknown => {
        if (options.connect.match(action)) {
          shouldReconnect = true;
          const result = next(action);
          openSocket();
          return result;
        }

        if (options.disconnect.match(action)) {
          shouldReconnect = false;
          closeSocket();
        }

        return next(action);
      };
  };
