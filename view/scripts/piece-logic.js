class abstractPiece {

    buildPosition() {

    }

    constructor(pieceCount) {
        this.movingPiece = true
        this.effectiveAxis = 0
        this.axis = 0
        this.gridPositions = []
        this.effectivePositions = []
        this.blocks = []
        this.color = 'white'
        this.id = pieceCount
    }

    set axis(value) {
        this._axis = value
        if (this._axis < 0) this._axis = 3
        else if (this._axis > 3) this._axis = 0
    }

    turnClockWise() {
        this.axis = this._axis + 1
        this.buildPosition()
    }

    turnCounterClockWise() {
        this.axis = this._axis - 1
        this.buildPosition()
    }

    forceAxis(axis) {
        this.axis = axis
        this.buildPosition()
        this.confirmPositions()
    }

    resetPositions(originalAxis) {
        this.gridPositions = this.effectivePositions
        this.axis = originalAxis
    }

    confirmPositions() {
        this.effectivePositions = this.gridPositions
    }
}

export class T_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'purple'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
                this.gridPositions = [
                    [0,2],
                    [1,1],
                    [1,2],
                    [1,3]
                ]
                break;
            case 1:
                this.gridPositions = [
                    [0,2],
                    [1,2],
                    [1,3],
                    [2,2]
                ]
                break;
            case 2:
                this.gridPositions = [
                    [1,1],
                    [1,2],
                    [1,3],
                    [2,2]
                ]
                break;
            case 3:
                this.gridPositions = [
                    [0,2],
                    [1,1],
                    [1,2],
                    [2,2]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class SQUARE_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'yellow'
        this.gridPositions = [
            [0,1],
            [0,2],
            [1,1],
            [1,2]
        ]
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
    }

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class L_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'orange'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
                this.gridPositions = [
                    [0,3],
                    [1,1],
                    [1,2],
                    [1,3]
                ]
                break;
            case 1:
                this.gridPositions = [
                    [0,2],
                    [1,2],
                    [2,2],
                    [2,3]
                ]
                break;
            case 2:
                this.gridPositions = [
                    [1,1],
                    [1,2],
                    [1,3],
                    [2,1]
                ]
                break;
            case 3:
                this.gridPositions = [
                    [0,1],
                    [0,2],
                    [1,2],
                    [2,2]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class REVERSE_L_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'DarkBlue'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
                this.gridPositions = [
                    [0,1],
                    [1,1],
                    [1,2],
                    [1,3]
                ]
                break;
            case 1:
                this.gridPositions = [
                    [0,2],
                    [1,2],
                    [2,2],
                    [0,3]
                ]
                break;
            case 2:
                this.gridPositions = [
                    [1,1],
                    [1,2],
                    [1,3],
                    [2,3]
                ]
                break;
            case 3:
                this.gridPositions = [
                    [2,1],
                    [0,2],
                    [1,2],
                    [2,2]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class Z_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'red'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
            case 2:
                this.gridPositions = [
                    [0,1],
                    [0,2],
                    [1,2],
                    [1,3]
                ]
                break;
            case 1:
            case 3:
                this.gridPositions = [
                    [0,3],
                    [1,2],
                    [1,3],
                    [2,2]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class REVERSE_Z_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'green'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
            case 2:
                this.gridPositions = [
                    [0,2],
                    [0,3],
                    [1,1],
                    [1,2]
                ]
                break;
            case 1:
            case 3:
                this.gridPositions = [
                    [0,1],
                    [1,1],
                    [1,2],
                    [2,2]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

export class LINE_piece extends abstractPiece {
    constructor(pieceCount) {
        super(pieceCount)
        this.color = 'LightBlue'
        this.buildPosition()
        this.confirmPositions()
    }

    turnClockWise() {
        super.turnClockWise()
        this.buildPosition()
    }

    turnCounterClockWise() {
        super.turnCounterClockWise()
        this.buildPosition()
    }

    buildPosition() {
        switch(this._axis) {
            case 0:
            case 2:
                this.gridPositions = [
                    [0,0],
                    [0,1],
                    [0,2],
                    [0,3]
                ]
                break;
            case 1:
            case 3:
                this.gridPositions = [
                    [0,1],
                    [1,1],
                    [2,1],
                    [3,1]
                ]
                break;
        }

    } 

    resetPositions (originalAxis) {
        super.resetPositions(originalAxis)
    }

    confirmPositions () {
        super.confirmPositions()
    }
}

