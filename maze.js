/**
 * @typedef {"never" | "always" | "after_down"} Accessibility
 * @typedef {{ hasWallRight: boolean, hasCeiling: boolean, isAccessible: Accessibility }[]} MazeRow
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
		this.extraLogging = false
		this.amt_new_rows = 10
	}
	/**
	 * Completely reset and update the accessibility of all cells.
	 */
	updateAccessibility() {
		for (var i = 0; i < this.rows.length; i++) {
			for (var j = 0; j < this.width; j++) {
				this.rows[i][j].isAccessible = "never"
			}
		}
		this.rows[0][0].isAccessible = "always"
		while (this.updateAccessibilityStage()) {}
	}
	/**
	 * Go through the whole board and find where acessibility can be
	 *  expanded to adjacent cells. If any changes are made, this
	 *  function will need to be called again.
	 * @returns Whether any changes were made.
	 */
	updateAccessibilityStage() {
		var rows = this.rows
		var needToReset = [false]
		/**
		 * @param {number} row
		 * @param {number} column
		 */
		function setAdjacentAccessible(row, column) {
			if (row < 0 || row >= rows.length) return
			var newRow = rows[row]
			if (column < 0 || column >= newRow.length) return
			var cell = newRow[column]
			// Check left and right
			if (column - 1 >= 0 && newRow[column - 1].hasWallRight == false) setAccessible(row, column - 1, cell.isAccessible == "after_down" ? "after_down" : "always")
			if (newRow[column].hasWallRight == false) setAccessible(row, column + 1, cell.isAccessible == "after_down" ? "after_down" : "always")
			// Check up and down
			if (newRow[column].hasCeiling == false) setAccessible(row + 1, column, cell.isAccessible == "after_down" ? "after_down" : "always")
			if (row - 1 >= 0 && rows[row - 1][column].hasCeiling == false) setAccessible(row - 1, column, "after_down")
		}
		/**
		 * Set a specific column in this row as accessible.
		 * @param {number} row
		 * @param {number} column
		 * @param {Accessibility} type
		 */
		function setAccessible(row, column, type) {
			if (row < 0 || row >= rows.length) return
			var newRow = rows[row]
			if (column < 0 || column >= newRow.length || newRow[column].isAccessible != "never") return
			newRow[column].isAccessible = type
			needToReset[0] = true
		}
		for (var i = this.rows.length - 1; i >= 0; i--) {
			for (var j = 0; j < this.width; j++) {
				if (this.rows[i][j].isAccessible != "never") {
					setAdjacentAccessible(i, j)
				}
			}
		}
		return needToReset[0]
	}
	getNextRowAttempt() {
		/**
		 * @type {MazeRow}
		 */
		var newRow = []
		for (var i = 0; i < this.width; i++) {
			newRow.push({
				hasWallRight: Math.random() < 0.4,
				hasCeiling: Math.random() < 0.6,
				isAccessible: "never"
			})
			if (i == this.width - 1) {
				newRow[i].hasWallRight = true
			}
		}
		return newRow
	}
	async addNextRow() {
		var tries = 0
		while (true) {
			tries += 1;
			if (tries % 1 == 0) {
				await new Promise((resolve) => requestAnimationFrame(resolve));
			}
			/** @type {MazeRow} */
			var newRow = [];
			for (var i = 0; i < this.amt_new_rows; i++) {
				var newRow = this.getNextRowAttempt()
				this.rows.push(newRow)
			}
			this.updateAccessibility();
			if (this.extraLogging) {
				console.log(`Rows ${this.rows.length - this.amt_new_rows} to ${this.rows.length} attempt ${tries}:`)
				this.printInfo()
			}
			// Check whether there is at least one column that
			// is considered accessible AND the ceiling at that column is gone
			var isValid = false;
			for (var i = 0; i < newRow.length; i++) {
				if (newRow[i].isAccessible != "never" && !newRow[i].hasCeiling) {
					// The cell in the next row directly above this
					// cell is accessible.
					isValid = true;
				}
			}
			if (isValid) break;
			else this.rows.splice(this.rows.length - this.amt_new_rows, this.amt_new_rows)
			if (tries >= 1000) {
				throw new Error("reached 1000 tries with no success")
			}
		}
		// Save the row!
		this.updateAccessibility()
		console.log(`Successfully generated rows ${this.rows.length - this.amt_new_rows} to ${this.rows.length} after ${tries} tries`)
	}
	/**
	 * @param {number} n
	 */
	async addNRows(n) {
		for (var i = 0; i < n; i += this.amt_new_rows) {
			await this.addNextRow();
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
	}
	printInfo() {
		var s = ""
		for (var i = 0; i < this.rows.length; i++) {
			for (var j = 0; j < this.width; j++) {
				if (this.rows[i][j].isAccessible) s += ".."
				else s += "  "
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

class MazeDrawing {
	static cellWidth = 150
	static cellHeight = 150
	static wallThickness = 30
	static showAccessibility = false
	/**
	 * @param {number} i
	 * @param {MazeRow} row
	 * @returns {GameObject[]}
	 */
	static drawRow(i, row) {
		/** @type {GameObject[]} */
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
				if (row[c].isAccessible && Math.random() < 0.1) {
					// Spike top
					boxes.push(new Spike((c + 0.5) * this.cellWidth, rowBottom - this.cellHeight, 180))
				}
			}
			// Spike bottom
			if (Math.random() < 0.1) {
				boxes.push(new Spike((c + 0.5) * this.cellWidth, rowBottom - this.wallThickness, 0))
			}
			// Accessibility
			if (this.showAccessibility) {
				if (row[c].isAccessible == "always") {
					boxes.push(new NonSolidBox(
						((c + 0.5) * this.cellWidth) - (this.wallThickness / 2),
						(rowBottom - (0.5 * this.cellHeight)) - (this.wallThickness / 2),
						this.wallThickness,
						this.wallThickness
					))
				} else if (row[c].isAccessible == "after_down") {
					boxes.push(new HighlightedNonSolidBox(
						((c + 0.5) * this.cellWidth) - (this.wallThickness / 2),
						(rowBottom - (0.5 * this.cellHeight)) - (this.wallThickness / 2),
						this.wallThickness,
						this.wallThickness
					))
				}
			}
		}
		return boxes
	}
	/**
	 * @param {MazeLayout} layout
	 * @returns {GameObject[]}
	 */
	static draw(layout) {
		/** @type {GameObject[]} */
		var boxes = []
		// Bottom
		boxes.push(Box.fromTopLeft(0, -this.wallThickness, (this.cellWidth * layout.width) - this.wallThickness, this.wallThickness, false))
		// Draw rows
		for (var i = 0; i < layout.rows.length; i++) {
			var newBoxes = MazeDrawing.drawRow(i, layout.rows[i])
			boxes.push(...newBoxes)
		}
		return boxes
	}
}
