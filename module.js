var HEIGHT = window.innerHeight
var WIDTH = window.innerWidth
var RENDER_ENABLED = false

// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite,
	Vector = Matter.Vector,
	Body = Matter.Body,
	Constraint = Matter.Constraint,
	Events = Matter.Events,
	Vertices = Matter.Vertices;

var engine = Engine.create();

/**
 * @type {Matter.Render | undefined}
 */
var render;
if (RENDER_ENABLED) {
	render = Render.create({
		element: document.body,
		engine,
		options: {
			wireframeBackground: "transparent",
			height: HEIGHT,
			width: WIDTH,
			// @ts-ignore
			enabled: true
		}
	});
	Render.run(render)
}

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
		if (render) Render.lookAt(render, {
			min: { x: camera.x, y: camera.y },
			max: { x: camera.x + WIDTH, y: camera.y + HEIGHT }
		})
	}
}

/** @type {GameObject[]} */
var objects = []

class GameObject {
	constructor() {
		this.elm = document.createElement("div")
	}
	add() {
		document.body.appendChild(this.elm)
		objects.push(this)
	}
	remove() {
		this.elm.remove()
		objects.splice(objects.indexOf(this), 1)
	}
	tick() {}
}
class PhysicsObject extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {Matter.Body} body
	 */
	constructor(x, y, body) {
		super()
		this.x = x
		this.y = y
		/** @type {Matter.Body} */
		this.body = body
		Body.setPosition(this.body, { x, y })
		// @ts-ignore
		this.body._PhysicsObject = this
	}
	add() {
		super.add()
		Composite.add(engine.world, this.body)
	}
	remove() {
		super.remove()
		Composite.remove(engine.world, this.body)
	}
	tick() {
		this.x = this.body.position.x
		this.y = this.body.position.y
		this.adjustPosition()
		var worldX = this.x - (this.getWidth() / 2)
		var worldY = this.y - (this.getHeight() / 2)
		this.elm.setAttribute("style", `top: ${(worldY - camera.y) * camera.zoom}px; left: ${(worldX - camera.x) * camera.zoom}px; width: ${this.getWidth() * camera.zoom}px; height: ${this.getHeight() * camera.zoom}px; transform: rotate(${this.body.angle}rad); ${this.getStyles()}`)
	}
	adjustPosition() {}
	getWidth() { return 50; }
	getHeight() { return 50; }
	getStyles() { return "background: black;"; }
	/**
	 * @param {PhysicsObject} other
	 */
	collided(other) {}
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
		super(x, y, Bodies.rectangle(x, y, w, h, {
			isStatic: !canMove
		}))
		this.w = w
		this.h = h
		this.canMove = canMove
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
class NonSolidBox extends GameObject {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(x, y, w, h) {
		super()
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.angle = 0
	}
	getWidth() { return this.w; }
	getHeight() { return this.h; }
	tick() {
		var worldX = this.x - (this.getWidth() / 2)
		var worldY = this.y - (this.getHeight() / 2)
		this.elm.setAttribute("style", `top: ${(worldY - camera.y) * camera.zoom}px; left: ${(worldX - camera.x) * camera.zoom}px; width: ${this.getWidth() * camera.zoom}px; height: ${this.getHeight() * camera.zoom}px; transform: rotate(${this.angle}rad); ${this.getStyles()}`)
	}
	getStyles() { return "background: black; opacity: 0.1;"; }
}
class HighlightedNonSolidBox extends NonSolidBox {
	getStyles() { return "background: blue; opacity: 0.1;"; }
}

Events.on(engine, "afterUpdate", () => {
	camera.tick()
	for (var o of objects) {
		o.tick()
	}
})
Events.on(engine, "collisionStart", (e) => {
	for (var pair of e.pairs) {
		/** @type {PhysicsObject} */
		// @ts-ignore
		var objectA = pair.bodyA._PhysicsObject
		/** @type {PhysicsObject} */
		// @ts-ignore
		var objectB = pair.bodyB._PhysicsObject
		// Collision
		objectA.collided(objectB)
		objectB.collided(objectA)
	}
})
