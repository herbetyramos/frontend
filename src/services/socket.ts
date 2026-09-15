import { io } from "socket.io-client";

export const socket = io(
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000",
  {
    transports: ["websocket"],
    autoConnect: true,
  }
);

