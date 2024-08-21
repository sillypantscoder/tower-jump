/**
 * @typedef {{ hasWallRight: boolean, hasCeiling: boolean, isAccessible: boolean }[]} MazeRow
 */

class MazeLayout {
	/**
	 * @param {number} width
	 */
	constructor(width) {
		this.width = width
		/**
		 * @type {MazeRow[]}
		 */
		this.rows = []
	}
	getPreviousRowAccessibility() {
		if (this.rows.length == 0) {
			var a = [true]
			for (var i = 1; i < this.width; i++) a.push(false)
			return a
		} else {
			var row = this.rows[this.rows.length - 1];
			/** @type {boolean[]} */ var a = [];
			for (var i = 0; i < this.width; i++) a.push(row[i].isAccessible && !row[i].hasCeiling)
			return a
		}
	}
	getNextRowAttempt() {
		/**
		 * @type {MazeRow}
		 */
		var newRow = []
		for (var i = 0; i < this.width; i++) {
			newRow.push({
				hasWallRight: Math.random() < 0.5,
				hasCeiling: Math.random() < 0.7,
				isAccessible: false
			})
			if (i == this.width - 1) {
				newRow[i].hasWallRight = true
			}
		}
		// Find which cells are accessible
		/**
		 * Set a specific column in this row as accessible.
		 * This also sets adjacent cells to accessible where possible.
		 * @param {number} i
		 */
		function setAccessible(i) {
			if (i < 0 || i >= newRow.length || newRow[i].isAccessible == true) return
			newRow[i].isAccessible = true
			if (newRow[i - 1] && newRow[i - 1].hasWallRight == false) setAccessible(i - 1)
			if (newRow[i].hasWallRight == false) setAccessible(i + 1)
		}
		var previous = this.getPreviousRowAccessibility()
		for (var i = 0; i < previous.length; i++) {
			if (previous[i]) {
				setAccessible(i)
			}
		}
		return newRow
	}
	addNextRow() {
		var tries = 0
		while (true) {
			tries += 1;
			var newRow = this.getNextRowAttempt()
			// Check whether there is at least one column that
			// is considered accessible AND the ceiling at that column is gone.
			var isValid = false;
			for (var i = 0; i < newRow.length; i++) {
				if (newRow[i].isAccessible && !newRow[i].hasCeiling) {
					// The cell in the next row directly above this
					// cell is accessible.
					isValid = true;
				}
			}
			if (isValid) break;
		}
		// Save the row!
		this.rows.push(newRow)
		console.log(`Successfully generated row ${this.rows.length} after ${tries} tries`)
	}
	/**
	 * @param {number} n
	 */
	addNRows(n) {
		for (var i = 0; i < n; i++) {
			this.addNextRow();
		}
	}
	printInfo() {
		var s = ""
		for (var i = 0; i < this.rows.length; i++) {
			for (var j = 0; j < this.width; j++) {
				s += "  "
				if (this.rows[i][j].hasWallRight) s += "|"
				else s += " "
			}
			s += "\n"
			for (var j = 0; j < this.width; j++) {
				if (this.rows[i][j].hasCeiling) s += "--"
				else s += "  "
				s += "#"
			}
			s += "\n"
		}
		console.log(s)
	}
}
function test() {
	var layout = new MazeLayout(5)
	layout.addNRows(10)
	layout.printInfo()
}
test()

class MazeDrawing {
	static cellWidth = 150
	static cellHeight = 150
	static wallThickness = 30
	/**
	 * @param {number} i
	 * @param {MazeRow} row
	 * @returns {Box[]}
	 */
	static drawRow(i, row) {
		/** @type {Box[]} */
		var boxes = []
		// Wall left
		var rowBottom = i * -this.cellHeight
		boxes.push(Box.fromTopLeft(-this.wallThickness, (rowBottom - this.cellHeight) - this.wallThickness, this.wallThickness, this.cellHeight + this.wallThickness, false))
		// Draw columns
		for (var c = 0; c < row.length; c++) {
			// Wall right
			if (row[c].hasWallRight) {
				boxes.push(Box.fromTopLeft(((c + 1) * this.cellWidth) - this.wallThickness, (rowBottom - this.cellHeight) - this.wallThickness, this.wallThickness, this.cellHeight + this.wallThickness, false))
			}
			// Ceiling
			if (row[c].hasCeiling) {
				boxes.push(Box.fromTopLeft((c * this.cellWidth) - this.wallThickness, (rowBottom - this.cellHeight) - this.wallThickness, this.cellWidth + this.wallThickness, this.wallThickness, false))
			}
		}
		return boxes
	}
	/**
	 * @param {MazeLayout} layout
	 * @returns {Box[]}
	 */
	static draw(layout) {
		/** @type {Box[]} */
		var boxes = []
		// Bottom
		boxes.push(Box.fromTopLeft(-this.wallThickness, 0, (this.cellWidth * layout.width) + this.wallThickness, this.wallThickness, false))
		// Draw rows
		for (var i = 0; i < layout.rows.length; i++) {
			var newBoxes = MazeDrawing.drawRow(i, layout.rows[i])
			boxes.push(...newBoxes)
		}
		return boxes
	}
}
