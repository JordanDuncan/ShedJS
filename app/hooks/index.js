import io from "socket.io-client";
import { API_URL } from "../lib/config";

const socket = io(API_URL, { autoConnect: false });

export const useSocket = () => {
  socket.open();
  return socket;
};
