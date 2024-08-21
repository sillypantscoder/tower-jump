class Player extends Box {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super(x, y, 50, 50, true)
		this.pressingLeft = false
		this.pressingRight = false
		this.body.friction = 0
	}
	tick() {
		super.tick()
		if (this.pressingLeft) this.moveLeft()
		if (this.pressingRight) this.moveRight()
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x * 0.95, v.y))
	}
	moveLeft() {
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x - 0.7, v.y))
	}
	moveRight() {
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x + 0.7, v.y))
	}
	jump() {
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x, (v.y / 1) - 11))
	}
}

/** @type {Player} */
var player = addPlayer();

function addPlayer() {
	player = new Player(MazeDrawing.cellWidth / 2, MazeDrawing.cellHeight / -2)
	player.add();
	// camera
	camera.target.object = player.body
	camera.tick()
	camera.x = camera.target.x
	camera.y = camera.target.y
	// return player
	return player
}

window.addEventListener("keydown", (e) => {
	if (e.key == "ArrowLeft") player.pressingLeft = true
	if (e.key == "ArrowRight") player.pressingRight = true
	if (e.key == "ArrowUp") player.jump()
})
window.addEventListener("keyup", (e) => {
	if (e.key == "ArrowLeft") player.pressingLeft = false
	if (e.key == "ArrowRight") player.pressingRight = false
})

function generateMaze() {
	var layout = new MazeLayout(5)
	layout.addNRows(45)
	var boxes = MazeDrawing.draw(layout)
	boxes.forEach((b) => b.add())
}
generateMaze()
