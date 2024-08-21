var HEIGHT = window.innerHeight
var WIDTH = window.innerWidth

// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite,
	Vector = Matter.Vector,
	Body = Matter.Body,
	Constraint = Matter.Constraint,
	Events = Matter.Events;

var engine = Engine.create();

var runner = Runner.create();
Runner.run(runner, engine);

var camera = {
	x: 0,
	y: 0,
	zoom: 1,
	target: {
		/** @type {{ position: { x: number, y: number } } | null} */
		object: null,
		x: 0,
		y: 0,
		zoom: 1
	},
	tick: () => {
		if (camera.target.object != null) {
			camera.target.x = camera.target.object.position.x - (WIDTH / 2)
			camera.target.y = camera.target.object.position.y - (HEIGHT / 2)
		}
		camera.x = ((camera.x * 10) + camera.target.x) / 11
		camera.y = ((camera.y * 10) + camera.target.y) / 11
		camera.zoom = ((camera.zoom * 10) + camera.target.zoom) / 11
	}
}

class GameObject {
	constructor() {
		this.elm = document.createElement("div")
	}
	add() {
		document.body.appendChild(this.elm)
	}
	remove() {
		this.elm.remove()
	}
	tick() {}
}
class PhysicsObject extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		super()
		this.x = x
		this.y = y
		/** @type {Matter.Body | null} */
		this.body = null
	}
	add() {
		if (this.body == null) this.setBody()
		if (this.body == null) throw new Error("this.setBody() did not add a body")
		super.add()
		Composite.add(engine.world, this.body)
	}
	setBody() {
		this.body = this.createBody()
		// @ts-ignore
		this.body._PhysicsObject = this
		Body.setPosition(this.body, { x: this.x, y: this.y })
	}
	/** @returns {Matter.Body} */
	createBody() {
		throw new Error("Please specify a body")
	}
	remove() {
		super.remove()
		if (this.body == null) throw new Error("Cannot remove nonexistent body")
		Composite.remove(engine.world, this.body)
	}
	tick() {
		if (this.body == null) throw new Error("Cannot tick object with nonexistent body")
		this.x = this.body.position.x
		this.y = this.body.position.y
		var worldX = this.x - (this.getWidth() / 2)
		var worldY = this.y - (this.getHeight() / 2)
		this.elm.setAttribute("style", `top: ${(worldY - camera.y) * camera.zoom}px; left: ${(worldX - camera.x) * camera.zoom}px; width: ${this.getWidth() * camera.zoom}px; height: ${this.getHeight() * camera.zoom}px; transform: rotate(${this.body.angle}rad); ${this.getStyles()}`)
	}
	getWidth() { return 50; }
	getHeight() { return 50; }
	getStyles() { return "background: black;"; }
}
class Box extends PhysicsObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {boolean} canMove
	 */
	constructor(x, y, w, h, canMove) {
		super(x, y)
		this.w = w
		this.h = h
		this.canMove = canMove
	}
	createBody() {
		return Bodies.rectangle(this.x, this.y, this.w, this.h, {
			isStatic: !this.canMove
		})
	}
	getWidth() { return this.w; }
	getHeight() { return this.h; }
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {boolean} canMove
	 */
	static fromTopLeft(x, y, w, h, canMove) {
		return new Box(x + (w / 2), y + (h / 2), w, h, canMove)
	}
}

Events.on(engine, "afterUpdate", () => {
	camera.tick()
	for (var body of [...engine.world.bodies]) {
		// @ts-ignore
		if (body._PhysicsObject) {
			// @ts-ignore
			body._PhysicsObject.tick()
		}
	}
})
