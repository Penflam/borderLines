import express from 'express'
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'
import { UsersState } from './src/usersState.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
const ADMIN = "Admin"

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`)
})
const io = new Server(expressServer, {
	cors: {
		origin: process.env.NODE_ENV === "production" ? false : [
			"http://localhost:5500",
			"http://127.0.0.1:5500",
			"http://127.0.0.1:3500"
		]
	}
})
io.on('connection', socket => {
	console.log(`User ${socket.id} connected`)

	// Upon connection - only to user 
	socket.emit('message', UsersState.buildMsg(ADMIN, "Welcome to Chat App!"))

	socket.on('enterRoom', ({ name, room }) => {

		// leave previous room 
		const prevRoom = UsersState.getUser(socket.id)?.room

		if (prevRoom) {
			socket.leave(prevRoom)
			io.to(prevRoom).emit('message', UsersState.buildMsg(ADMIN, `${name} has left the room`))
		}

		const user = UsersState.activateUser(socket.id, name, room)

		// Cannot update previous room users list until after the state update in activate user 
		if (prevRoom) {
			io.to(prevRoom).emit('userList', {
				users: UsersState.getUsersInRoom(prevRoom)
			})
		}

		// join room 
		socket.join(user.room)

		// To user who joined 
		socket.emit('message', UsersState.buildMsg(ADMIN, `You have joined the ${user.room} chat room`))

		// To everyone else 
		socket.broadcast.to(user.room).emit('message', UsersState.buildMsg(ADMIN, `${user.name} has joined the room`))

		// Update user list for room 
		io.to(user.room).emit('userList', {
			users: UsersState.getUsersInRoom(user.room)
		})

		// Update rooms list for everyone 
		io.emit('roomList', {
			rooms: UsersState.getAllActiveRooms()
		})
		// Update rooms list for everyone 
		io.to(user.room).emit('addPlayer', {
			rooms: UsersState.getAllActiveRooms()
		})
	})

	// When user disconnects - to all others 
	socket.on('disconnect', () => {
		const user = UsersState.getUser(socket.id)
		UsersState.userLeavesApp(socket.id)

		if (user) {
			io.to(user.room).emit('message', UsersState.buildMsg(ADMIN, `${user.name} has left the room`))

			io.to(user.room).emit('userList', {
				users: UsersState.getUsersInRoom(user.room)
			})

			io.emit('roomList', {
				rooms: UsersState.getAllActiveRooms()
			})
		}

		console.log(`User ${socket.id} disconnected`)
	})

	// Listening for a message event 
	socket.on('message', ({ name, text }) => {
		const room = UsersState.getUser(socket.id)?.room
		if (room) {
			io.to(room).emit('message', UsersState.buildMsg(name, text))
		}
	})

	// Listen for activity 
	socket.on('activity', (name) => {
		const room = UsersState.getUser(socket.id)?.room

		if (room) {
			const paquet = {
				name: name,
				user:UsersState.getUser(socket.id)
			}
			socket.broadcast.to(room).emit('activity', paquet)
		}
	})
})