class Player extends Box {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super(x, y, 50, 50, true)
		this.pressingLeft = false
		this.pressingRight = false
	}
	setBody() {
		super.setBody()
		if (this.body == null) throw new Error("this.setBody() did not add a body")
		this.body.friction = 0
	}
	tick() {
		super.tick()
		if (this.body == null) throw new Error("Cannot tick object with nonexistent body")
		if (this.pressingLeft) this.moveLeft()
		if (this.pressingRight) this.moveRight()
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x * 0.95, v.y))
	}
	moveLeft() {
		if (this.body == null) throw new Error("Cannot perform movement on player with nonexistent body")
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x - 0.7, v.y))
	}
	moveRight() {
		if (this.body == null) throw new Error("Cannot perform movement on player with nonexistent body")
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x + 0.7, v.y))
	}
	jump() {
		if (this.body == null) throw new Error("Cannot perform movement on player with nonexistent body")
		var v = Body.getVelocity(this.body)
		Body.setVelocity(this.body, Vector.create(v.x, (v.y / 1) - 10))
	}
}

// Maze settings
var wallThickness = 40
var cellHeight = 150
var cellWidth = 150
var mazeWidth = 5
var mazeHeight = 45

/** @type {Player} */
var player = addPlayer();

function addPlayer() {
	player = new Player(cellWidth / 2, 0)
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
	// Generate the maze
	//   (get a list of the current maze state)
	var lastFloors = []
	var lastAcc = []
	for (var i = 0; i < mazeWidth; i++) {
		lastFloors.push(false)
		lastAcc.push(false)
	}
	lastAcc[0] = true
	// Function to generate a row:
	/**
	 * @param {number} y
	 * @param {boolean[]} prevFloors
	 * @param {boolean[]} prevAccessible
	 */
	function generateMazeRow(y, prevFloors, prevAccessible) {
		// Walls
		Box.fromTopLeft(0, y, wallThickness, cellHeight, false).add();
		Box.fromTopLeft(cellWidth * mazeWidth, y, wallThickness, cellHeight, false).add();
		// Generate the maze
		var valid = false
		var tries = 0
		/** @type {boolean[]} */
		var floor = []
		/** @type {boolean[]} */
		var walls = []
		/** @type {boolean[]} */
		var accessible = []
		while (! valid) {
			floor = []
			walls = []
			for (var i = 0; i < mazeWidth; i++) {
				floor.push(Math.random() < 0.7)
			}
			for (var i = 0; i < mazeWidth; i++) {
				walls.push(Math.random() < 0.5)
			}
			// Validate the maze
			accessible = []
			for (var i = 0; i < mazeWidth; i++) {
				accessible.push(false)
			}
			// Set a specific column in this row as accessible.
			// This also sets adjacent cells to accessible where possible.
			/**
			 * @param {number} i
			 */
			function setAccessible(i) {
				if (i < 0 || i >= mazeWidth || accessible[i] == true) return
				accessible[i] = true
				if (walls[i] == false) setAccessible(i - 1)
				if (walls[i + 1] == false) setAccessible(i + 1)
			}
			for (var i = 0; i < prevFloors.length; i++) {
				if (! prevFloors[i]) {
					if (prevAccessible[i]) {
						setAccessible(i)
					}
				}
			}
			// Check whether there is at least one column that
			// is considered accessible AND the floor at that column is gone.
			var valid = false
			for (var i = 0; i < accessible.length; i++) {
				if (accessible[i] && (! floor[i])) {
					valid = true
				}
			}
			tries += 1
		}
		// Draw the maze
		for (var i = 0; i < floor.length; i++) {
			if (floor[i]) {
				Box.fromTopLeft(i * cellWidth, y + cellHeight, cellWidth, wallThickness, false).add();
			}
		}

		for (var i = 0; i < walls.length; i++) {
			if (walls[i]) {
				Box.fromTopLeft(i * cellWidth, y, wallThickness, cellHeight, false).add();
			}
			if (accessible[i]) {
				//createRect((i + 0.5) * cellWidth, y + (0.5 * cellHeight), 5, 5, false)
			}
		}
		// Finish
		console.log(`Finished row ${y / cellHeight} after ${tries} tries`)
		return [floor, accessible]
	}
	// Generate the rows
	for (var i = 0; i < mazeHeight; i++) {
		var result = generateMazeRow(i * cellHeight, lastFloors, lastAcc)
		lastFloors = result[0]
		lastAcc = result[1]
	}
	// Add walls
	Box.fromTopLeft(0, -wallThickness, mazeWidth * cellWidth, wallThickness, false).add();
	Box.fromTopLeft(0, mazeHeight * cellHeight, mazeWidth * cellWidth, wallThickness, false).add();
}
generateMaze()
