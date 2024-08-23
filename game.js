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
	remove() {
		super.remove()
		player = null
		camera.target.object = null
		PlayerFragment.spawn(this)
	}
}
class PlayerFragment extends Box {
	static gridsize = 4;
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} vx
	 * @param {number} vy
	 */
	constructor(x, y, vx, vy) {
		var pxsize = 50 / PlayerFragment.gridsize
		super(x + (pxsize / 2), y + (pxsize / 2), pxsize, pxsize, true)
		Body.setVelocity(this.body, {
			x: vx + ((Math.random() - 0.5) / 10),
			y: vy + ((Math.random() - 0.5) / 10)
		})
	}
	/**
	 * @param {Player} p
	 */
	static spawn(p) {
		var pxsize = 50 / PlayerFragment.gridsize
		for (var x = 0; x < PlayerFragment.gridsize; x++) {
			for (var y = 0; y < PlayerFragment.gridsize; y++) {
				var sx = p.x + (x * pxsize) - 25;
				var sy = p.y + (y * pxsize) - 25;
				(new PlayerFragment(sx, sy, p.body.velocity.x, p.body.velocity.y)).add();
			}
		}
	}
}
class Spike extends PhysicsObject {
	static size = 20;
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} deg
	 */
	constructor(x, y, deg) {
		var rad = deg * (Math.PI / 180)
		var xoffset = -1 * Spike.size * Math.sin(rad)
		var yoffset = -1 * Spike.size * Math.cos(rad)
		var q = Spike.getMysteryOffset(rad)
		super(x + xoffset + q.x, y + yoffset + q.y, Bodies.fromVertices(0, 0, [[
			{ x: -Spike.size, y: Spike.size },
			{ x:  Spike.size, y: Spike.size },
			{ x: 0, y: -Spike.size }
		]], { isStatic: true }))
		this.deg = deg
		Body.setAngle(this.body, rad)
	}
	/**
	 * @param {number} rad
	 */
	static getMysteryOffset(rad) {
		var x = 5 * Math.sin(rad)
		var y = 5 * Math.cos(rad)
		return { x, y }
	}
	adjustPosition() {
		var q = Spike.getMysteryOffset(this.body.angle)
		this.x -= q.x
		this.y -= q.y
	}
	getWidth() { return Spike.size * 2; }
	getHeight() { return Spike.size * 2; }
	getStyles() { return "background: red; clip-path: polygon(0% 100%, 100% 100%, 50% 0%);" }
	/**
	 * @param {PhysicsObject} other
	 */
	collided(other) {
		if (other == player) {
			player.remove()
		}
	}
}

function clearScreen() {
	for (; objects.length > 0; ) {
		objects[0].remove()
	}
}

/** @type {Player | null} */
var player = null;

function addPlayer() {
	clearScreen()
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
	if (player == null) return
	if (e.key == "ArrowLeft") player.pressingLeft = true
	if (e.key == "ArrowRight") player.pressingRight = true
	if (e.key == "ArrowUp") player.jump()
})
window.addEventListener("keyup", (e) => {
	if (player == null) return
	if (e.key == "ArrowLeft") player.pressingLeft = false
	if (e.key == "ArrowRight") player.pressingRight = false
})

async function generateMaze() {
	var layout = new MazeLayout(10)
	await layout.addNRows(35)
	var boxes = MazeDrawing.draw(layout)
	// Draw to the screen
	addPlayer()
	boxes.forEach((b) => b.add())
}
requestAnimationFrame(generateMaze)
