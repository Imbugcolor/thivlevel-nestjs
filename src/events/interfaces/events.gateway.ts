export interface ServerToClientEvents {
  TRANSACTION_SUCCESS: () => void;
  TRANSACTION_FAILED: (payload: string) => void;
  sendNotification: <T>(payload: T) => void;
}
