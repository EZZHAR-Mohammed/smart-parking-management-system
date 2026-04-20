import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  autoConnect: false,
  transports: ['websocket'],
})

export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token }
    socket.connect()
  }
}

export const disconnectSocket = () => socket.disconnect()

export default socket
