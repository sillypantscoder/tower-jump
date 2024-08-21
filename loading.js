/**
 * @param {string} text
 */
function measureTextHeight(text) {
    // create a temp canvas
    var width=1000;
    var height=60;
    var canvas=document.createElement("canvas");
    canvas.width=width;
    canvas.height=height;
    var ctx=canvas.getContext("2d");
	if (ctx == null) throw new Error("missing context")

    // Draw the entire a-z/A-Z alphabet in the canvas
    ctx.save();
    ctx.font="50px sans-serif";
    ctx.clearRect(0,0,width,height);
    ctx.fillText(text, 0, 40);
    ctx.restore();

    // Get the pixel data from the canvas
    var data = ctx.getImageData(0,0,width,height).data,
        first = false,
        last = false,
        r = height,
        c = 0;

    // Find the last line with a non-transparent pixel
    while(!last && r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                // @ts-ignore
                last = r;
                break;
            }
        }
    }

    // Find the first line with a non-transparent pixel
    while(r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                // @ts-ignore
                first = r;
                break;
            }
        }

        // If we've got it then return the height
        // @ts-ignore
        if(first != r) return last - first;
    }

    // error condition if we get here
    return 0;
}
/**
 * @param {string} t
 */
function getTextSize(t) {
	var e = document.createElement("div")
	e.innerText = t
	document.body.appendChild(e)
	var box = e.getBoundingClientRect()
	e.remove()
	return [box.width, box.height]
}
class TextBody extends Box {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {TextBox} o
	 */
	constructor(x, y, w, h, o) {
		super(x, y, w, h, true)
		this.o = o
		var speed = 3
		Body.setVelocity(this.body, {
			x: (Math.random() - 0.5) * speed,
			y: (Math.random() - 1) * speed
		})
		Body.setAngularVelocity(this.body, (Math.random() - 0.5) * 0.3)
	}
	tick() {
		super.tick()
		this.o.x = this.body.position.x
		this.o.y = this.body.position.y
		this.o.angle = this.body.angle
		this.o.adjustPosition()
	}
	getStyles() { return "background: #AAA;"; }
}
class TextBox extends NonSolidBox {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} t
	 */
	constructor(x, y, t) {
		super(x, y, getTextSize(t)[0], getTextSize(t)[1])
		this.elm.innerText = t
		this.offset = (getTextSize(t)[1] - measureTextHeight(t)) * 0
		this.o = new TextBody(x, y, getTextSize(t)[0], measureTextHeight(t), this)
	}
	add() { super.add(); this.o.add(); }
	getStyles() { return "z-index: 10;"; }
	adjustPosition() {
		this.x += (this.offset * Math.sin(this.angle))
		this.y += (this.offset * Math.cos(this.angle))
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} t
	 */
	static addAllChars(x, y, t) {
		var cx = x
		for (var i = 0; i < t.length; i++) {
			if (t[i] == " ") {
				cx += 60;
				continue
			}
			var o = new TextBox(cx, y, t[i])
			o.add();
			cx += o.w
		}
		return cx
	}
}
(() => {
	// Find what text to use
	var texts = [
		"LOADING",
		// "IT'S LOADING",
		// "WAIT FOR IT",
		// "PLEASE HOLD",
		// "PLEASE WAIT",
		// "GENERATING",
		// "GAME IS LOADING",
		// "MAZE IS GENERATING",
		"LOADING GAME",
		"GENERATING",
		"GENERATING THE MAZE",
		"FINDING PATHS",
		"FIXING BUGS",
		"FINDING BUGS",
		"ADDING SEMICOLONS",
		"REMOVING SEMICOLONS",
		"DOWNLOADING INTERNET",
		"COLLIDING BOXES",
		"CONSTRUCTING WALLS",
		"REMOVING HEROBRINE",
		"CAPTURING PIRATES",
		"LOADING LEVEL",
		"LOADING MAZE",
		"LOADING THE GENERATOR",
		"GENERATING THE LOADER",
		"PLAYTESTING",
		"DISCARDING INFORMATION",
		"CREATING BUGS",
		"SPAWNING WALLS",
		"FINDING PLAYER",
		"GENERATING LOADING MESSAGES",
		"COLLECTING DUST",
		"SIMULATING UNIVERSE",
		"ORGANIZING PARENTHESES",
		"ARRANGING BRACKETS",
		"RUNNING CODE",
		"CREATING ANTICIPATION",
		"CHECKING THE WEATHER",
		"EXPLODING THE SUN",
		"SPAWNING TNT",
		"LOADING THE LOADER",
		"INSTALLING THE DOWNLOADER",
		"DOWNLOADING THE INSTALLER",
		"INSTALLING THE INSTALLER",
		"CALLING FUNCTIONS",
		"ASSIGNING VARIABLES",
		"SYNCHRONIZING",
		"GETTING DISTRACTED",
		"BUILDING THE MAZE",
		"DRAWING SQUARES",
		"MULTIPLYING NUMBERS",
		"DOING MATH",
		"ENSURING SATISFACTION",
		"ADDING FEATURES",
		"REFACTORING",
		"TRANSPILING",
		"COMPILING",
		"DECOMPILING CODE",
		"SIMULATING ATOMS",
		"CALCULATNG DATA",
		"CALCULATING SPEED",
		"INCREASING SPEED",
		"DECREASING SPEED",
		"EATING BANANAS",
		"MAKING PARTICLE ACCELERATOR"
	]
	var text = texts[Math.floor(Math.random() * texts.length)] + "..."
	// Make the texts
	var textLeft = 150
	var textRight = TextBox.addAllChars(textLeft, 100, text);
	// Bottom platform
	var center = (textLeft + textRight) / 2
	var width = textRight - textLeft;
	(new Box(center - 15, 300, width + 150, 50, false)).add();
})();
