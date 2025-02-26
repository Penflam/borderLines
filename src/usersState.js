export const UsersState = {
	users: [],
	setUsers: function (newUsersArray) {
		this.users = newUsersArray
	},
	getTime: function(){
		return new Intl.DateTimeFormat('default', {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		}).format(new Date())
	},
	buildMsg: function (name, text) {
		return {
			name,
			text,
			time: this.getTime()
		}
	},
	activateUserInNewRoom: function (id, name, couleur, room) {
		let datas = {
			pos : {x:0,y:0,z:0},
			time : this.getTime(),
			couleur: couleur
		}
		const user = { id, name, couleur, room, datas}
		console.log('newUserINRoom')
		console.log(user)
		this.setUsers([
			...this.users.filter(user => user.id !== id),
			user
		])
		return user
	},
	userLeavesApp: function (id) {
		this.setUsers(
			this.users.filter(user => user.id !== id)
		)
	},
	setUserPos: function (id,pos) {
		let user =  this.users.find(user => user.id === id)
		user.datas.pos = pos
	},
	getUser: function (id) {
		return this.users.find(user => user.id === id)
	},
	getUsersInRoom: function (room) {
		return this.users.filter(user => user.room === room)
	},
	getUsers: function (id) {
		return this.users.filter(user => user.id != id)
	},
	getAllActiveRooms: function () {
		return Array.from(new Set(this.users.map(user => user.room)))
	}



}