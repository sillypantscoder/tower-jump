function measureTextHeight(text) {
    // create a temp canvas
    var width=1000;
    var height=60;
    var canvas=document.createElement("canvas");
    canvas.width=width;
    canvas.height=height;
    var ctx=canvas.getContext("2d");

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
                first = r;
                break;
            }
        }

        // If we've got it then return the height
        if(first != r) return last - first;
    }

    // error condition if we get here
    return 0;
}
function getTextWidth(t) {
	var e = document.createElement("div")
	e.innerText = t
	document.body.appendChild(e)
	var box = e.getBoundingClientRect()
	e.remove()
	return [box.width, box.height]
}
class TextBody extends Box {
	constructor(x, y, w, h, o) {
		super(x, y, w, h, true)
		this.o = o
		this.body.vx = Math.random() - 0.5
		this.body.vy = Math.random() - 0.5
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
class Text extends NonSolidBox {
	constructor(x, y, t) {
		super(x, y, getTextWidth(t)[0], getTextWidth(t)[1])
		this.elm.innerText = t
		this.offset = (getTextWidth(t)[1] - measureTextHeight(t)) * 0
		this.o = new TextBody(x, y, getTextWidth(t)[0], measureTextHeight(t), this)
	}
	add() { super.add(); this.o.add(); }
	getStyles() { return "z-index: 10;"; }
	adjustPosition() {
		this.x += (this.offset * Math.sin(this.angle))
		this.y += (this.offset * Math.cos(this.angle))
	}
	static addAllChars(x, y, t) {
		var cx = x
		for (var i = 0; i < t.length; i++) {
			var o = new Text(cx, y, t[i])
			o.add();
			cx += o.w
		}
	}
}
Text.addAllChars(50, -100, "Check it out there's some text :)")
