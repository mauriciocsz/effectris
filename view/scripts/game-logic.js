import { T_piece } from "./piece-logic.js"
import { SQUARE_piece } from "./piece-logic.js"
import { L_piece } from "./piece-logic.js"
import { REVERSE_L_piece } from "./piece-logic.js"
import { Z_piece } from "./piece-logic.js"
import { REVERSE_Z_piece } from "./piece-logic.js"
import { LINE_piece } from "./piece-logic.js"


import { sendLines } from "./connection-logic.js"
import { requestStart } from "./connection-logic.js"
import { notifyLoss } from "./connection-logic.js"
import { sendCurse } from "./connection-logic.js"


function getNewPiece(pieceCount) {
    let piece = undefined;
    switch (Math.floor(Math.random() * 7)) {
        case 0: 
            piece = new T_piece(pieceCount)
            break;
        case 1:
            piece = new SQUARE_piece(pieceCount)
            break
        case 2:
            piece = new L_piece(pieceCount)
            break
        case 3:
            piece = new REVERSE_L_piece(pieceCount)
            break
        case 4:
            piece = new Z_piece(pieceCount)
            break
        case 5:
            piece = new REVERSE_Z_piece(pieceCount)
            break
        case 6:
            piece = new LINE_piece(pieceCount)
            break
    }
    return piece
}

// Example
let pieceBlock = {
    pieceId: '1', // code referring to the piece it belongs to
    color: '#fffff', // dunno about keeping the color here, but dont think it'd be good to keep in the main object
    effects: [
        //TODO: effect descriptive object 
    ]
}

class block {
    constructor() {
        this.pieceId = null
        this.color = null
        this.effects = []
        this.isShadow = false
    }

    get hasPiece() {
        return (this.pieceId != null)
    } 

    fillBlock(originalPieceId, color) {
        this.pieceId = originalPieceId
        this.color = color
    }

    clearBlock() {
        this.pieceId = null
        this.color = null
        this.clearEffects()
    }

    clearEffects() {
        this.effects = []
        //TODO: remove effects related to the piece, but not the space 
    }
}

const fieldHeight=21
const fieldWidth=10

var mainPiece = undefined
var backupPiece = undefined
var followingPieces = []

var fieldRenderProcess = undefined
var gameProgressProcess = undefined
var isGameSpedUp = false

var pieceCount = 0
var currentX = 0
var currentY = 3
var gameStatus = false
var hasBackup = true

var comboCount = 0
var incomingLines = 0
var powerCharges = 0
var gameSpells = {}
var gameCurses = {}

const fieldData = Array(fieldHeight).fill().map(() => (Array(fieldWidth).fill().map(() => new block())))
const nextPieceData =  Array(4).fill().map(() => (Array(3).fill().map(() => new block())))
const otherPlayers = {}
var followingPiecesData = []

pieceCount++
mainPiece = getNewPiece(pieceCount)

for (let x = 0 ; x < 5 ; x++) {
    pieceCount++
    followingPieces.push(getNewPiece(pieceCount))
    followingPiecesData.push(Array(4).fill().map(() => (Array(3).fill().map(() => new block()))))
}

function resetVariables() {
    mainPiece = undefined
    backupPiece = undefined
    followingPieces = []
    isGameSpedUp = false

    pieceCount = 0
    currentX = 0
    currentY = 3
    gameStatus = true
    hasBackup = true

    comboCount = 0
    incomingLines = 0
    powerCharges = 0
    gameSpells = {}
    gameCurses = {}

    
    nextPieceData.forEach((line) => {
        line.forEach((block) => {
            block.clearBlock()
        })
    })

    fieldData.forEach((line) => {
        line.forEach( (block) => {
            block.clearBlock()
        })
    })
    followingPiecesData = []

    pieceCount++
    mainPiece = getNewPiece(pieceCount)

    for (let x = 0 ; x < 5 ; x++) {
        pieceCount++
        followingPieces.push(getNewPiece(pieceCount))
        followingPiecesData.push(Array(4).fill().map(() => (Array(3).fill().map(() => new block()))))
    }

    document.getElementById('barMsg').style.visibility = 'hidden'
}


function moveMainPiece() {
    if(!gameStatus)
        return


    let collision = false;

    mainPiece.effectivePositions.forEach ( position => {
        let xPosition = currentX + position[0]

        if (xPosition >= fieldHeight) {
            collision = true;
        } else {
            let nextBlock = fieldData[xPosition][currentY + position[1]]
            if(!nextBlock) {
                return
            }
            if (nextBlock.hasPiece && nextBlock.pieceId != mainPiece.id) {
                collision = true;
            }
        }

    })

    if (collision) {
        console.log('not game over x was ' + currentX + ' y was ' + currentY)
        if ((currentX ==0 || currentX == 1) && currentY == 3) {
            gameOver()
            return
        }
        clearFilledLines()
        putNewPiece()
        hasBackup = true
        return;
    }


    mainPiece.blocks.forEach( block => {
        block.clearBlock()
        block.clearEffects()
    })

    mainPiece.blocks = []

    mainPiece.effectivePositions.forEach( position => {    
        let newBlock = fieldData[currentX + position[0]][currentY + position[1]]
        newBlock.fillBlock(mainPiece.id, mainPiece.color)
        mainPiece.blocks.push(newBlock)
    })

    renderShadowPiece()
}

function predictPieceLanding(x) {
    let collision = false;

    mainPiece.effectivePositions.forEach ( position => {
        let xPosition = x + position[0]

        if (xPosition >= fieldHeight) {
            collision = true;
        } else {
            let nextBlock = fieldData[xPosition][currentY + position[1]]
            if (nextBlock.hasPiece && nextBlock.pieceId != mainPiece.id) {
                collision = true;
            }
        }

    })

    return collision
}

function renderShadowPiece() {
    fieldData.forEach( row => {
        row.forEach( block => block.isShadow = false)
    })
    let x = currentX
    while (predictPieceLanding(x)!=true) x++

    mainPiece.effectivePositions.forEach( position => {
        let newBlock = fieldData[x-1 + position[0]][currentY + position[1]]
        newBlock.isShadow = true
        newBlock.color = mainPiece.color
    })
    
}

function createOtherFields(playerIds) {
    playerIds.forEach( playerId => {
        var div = document.createElement('div')
        div.id = playerId
        div.style = "margin: 10px"
        document.querySelector("#otherPlayers").appendChild(div)
    })
}

function renderOtherPlayersFields(fields) {

    for (const [key, value] of Object.entries(fields)) {
        let html = '<table cellpadding=0 cellspacing=0>'

        value.slice(1,21).forEach( row => {
            html+='<tr>'
            row.forEach (block => {
                let color = block.color? (block.isShadow? 'black' : block.color) : 'black'
                html+= '<td bgcolor="'+ color +'" class="otherPlayersTd"/>'
            })

            html+='</tr>'
        })

        html+="</table>"

        document.getElementById(key).innerHTML = html
      }
}

function renderField() {
    let html = '<table cellpadding=0 cellspacing=0 class="mainTable">'

    var field = fieldData.slice()

    if(gameCurses['upside_down'])
        field = field.reverse()

    field.slice(1,21).forEach( row => {
        html+='<tr>'
        row.forEach (block => {
            let color = block.hasPiece?
             (block.effects.some( effect => effect['id'] === '1900' )? '#050505': block.color) 
             : 
             (block.isShadow? block.color : 'black')

             
            let opacity = (!block.hasPiece && block.isShadow)? 'filter: brightness(0.7);' : ''
            html+= '<td bgcolor="'+ color +'" style="' +opacity +'" class="fieldTd"/>'
        })

        html+='</tr>'
    })

    html+="</table>"

    document.querySelector("#canvas").innerHTML = html

    let html2 = '<table cellpadding=0 cellspacing=0>'

    for (let x = 19; x >= 0; x--) {
        html2+= '<tr>'
        html2+= '<td bgcolor="'+ (x < (incomingLines - comboCount) ? 'red':'black') +'" class="incomingBarTd"/>'
        html2+= '</tr>'
    }

    html2+='</table>'
    document.querySelector("#incomingBar").innerHTML = html2

}

function forcePutPiece() {
    let currentPiece = pieceCount

    while(currentPiece == pieceCount && gameStatus) {
        gameProgress()
        moveMainPiece()
    }
}

function movePieceHorizontally(orientation) {
    let canMove = mainPiece.effectivePositions.filter( gridpos => {
        return (currentY + gridpos[1] + orientation) >= fieldWidth || (currentY + gridpos[1] + orientation) < 0
    }).length == 0

    if (canMove) {
        currentY = currentY + orientation
    }
}

function gameProgress() {
    if (gameStatus) {
        currentX = currentX + 1
        moveMainPiece()
    }
}


function clearFilledLines() {

    var linesMade = 0

    fieldData.forEach ( (row, index) => {
        if(row.every( (block) => block.hasPiece)) {
            linesMade++
            row.forEach(block => block.clearBlock())

            for(let x = index; x > 0 ; x--) {
                fieldData[x] = fieldData[x-1]
            }

            fieldData[0] = (Array(fieldWidth).fill().map(() => new block()))

            // se for zero limpar tudo de "cima" vai dar bem errado
        }
    })

    if (linesMade > 0) {
        comboCount += linesMade
    } else if (comboCount!=0) {
        createEnemySendLines(comboCount)
        sendLines(comboCount)
        comboCount = 0
    } else {
        createEnemySendLines(comboCount)
    }
}

function gameOver() {
    gameStatus = false
    console.log('Game over')

    clearInterval(fieldRenderProcess)
    clearInterval(gameProgressProcess)

    fieldData.forEach( (line) => {
        line.forEach( (block) => {
            if (block.hasPiece) {
                block.color = 'grey'
            }
        })
    })

    renderField()
    notifyLoss()

    //alert("Game over")
}

function createEnemySendLines(comboCount) {
    let lineQnt = incomingLines - comboCount 

    for (let x=0; x<lineQnt; x++) {
        for (let i= 0; i < fieldHeight; i++) {
            let row = fieldData[i]
            if (i == 0) {
                if (!row.every( (block) => !block.hasPiece)) {
                    gameOver()
                    return
                }
            } else {
                fieldData[i-1] = row
            }
        }

        var enemyLine = (Array(fieldWidth).fill().map(() => {
            let newblock = new block()
            newblock.fillBlock(-1, 'grey')
            return newblock
        }))

        enemyLine[Math.floor(Math.random() * 9)].clearBlock()

        fieldData[fieldHeight - 1] = enemyLine
    }

    incomingLines = 0
}

function increaseEnemyLines(qnt) {
    incomingLines += qnt
}


function tryTurning(method) {
    var canExecute = true

    var originalAxis = mainPiece._axis

    try {
        if (method == -1) {
            mainPiece.turnCounterClockWise()
        } else if (method == 1) {
            mainPiece.turnClockWise()
        } else {
            mainPiece.turnCounterClockWise()
            mainPiece.turnCounterClockWise()
        }
        mainPiece.gridPositions.forEach( position => {
            let projectedBlock = fieldData[currentX + position[0]][currentY + position[1]]
            
            if (!(projectedBlock instanceof block)) {
                canExecute = false
            }
        })

    } catch (e) {
        canExecute = false
    } finally {
        if (canExecute) {
            mainPiece.confirmPositions()
        } else {
            mainPiece.resetPositions(originalAxis)
        }
    }
}

// Ao usuário apertar o botão
document.onkeydown = function(e){
    if(!gameStatus){
        return
    }
    
    e = e || window.event;
    var key = e.which || e.keyCode;
    switch (key){
        case 37: // LEFT 100://
            movePieceHorizontally(-1)
            break
        case 38: // UP 69: //
            tryTurning(1)
            //mainPiece.turnClockWise()
            break
        case 81:
            tryTurning(-1)
            //mainPiece.turnCounterClockWise()
            break
        case 87: 
            tryTurning(0)
            break
        case 39: // RIGHT 102: //
            movePieceHorizontally(+1)
            break   
        case 32: //SPACE
            forcePutPiece()
            break;
        case 67: // C 104: //
            activateBackup()
            break;
        case 40: // DOWN 101: //
            fastDrop(true)
            isGameSpedUp = true 
            break
        case 74: // J
            useSpell()
            break
        case 75:
            useCurse()
            break
    }
    
    moveMainPiece()
    
}

function fastDrop(active) {
    if(isGameSpedUp)
        return
    var speed = active? 35 : 1000
    clearInterval(gameProgressProcess)
    gameProgressProcess = setInterval(gameProgress, speed)
}

document.onkeyup = function(e){
    if(!gameStatus){
        return
    }

    e = e || window.event;
    var key = e.which || e.keyCode;
    switch (key){
        case 40: // DOWN 101: //
            isGameSpedUp = false
            fastDrop(false)
            break      
    }

    moveMainPiece()
}

function removePieceFromField(piece) {
    piece.blocks.forEach( block => {
        block.clearBlock()
    })

    piece.blocks = []
}

function putNewPiece(piece) {
    currentX = 0
    currentY = 3
    isGameSpedUp = false

    if (piece) {
        mainPiece = piece
    } else {
        pieceCount++
        mainPiece = followingPieces.shift()
        followingPieces.push(getNewPiece(pieceCount))
    }

    mainPiece.forceAxis(0)
    mainPiece.confirmPositions()

    renderField()
    drawFollowingPieces()
}

function activateBackup () {

    if(backupPiece && gameSpells['deep_pockets'] != undefined) {
        removePieceFromField(mainPiece)

        var nextUp = new backupPiece.constructor(backupPiece.id + '_' + gameSpells['deep_pockets']['count']++)
        nextUp.forceAxis(0)
        putNewPiece(nextUp)
        // backupPiece = nextUp

        return
    }


    if(!hasBackup) {
        return 
    }
    
    hasBackup = false

    removePieceFromField(mainPiece)

    if(mainPiece instanceof LINE_piece) {
        mainPiece.forceAxis(1)
        mainPiece.confirmPositions()
    } else {
        mainPiece.forceAxis(0)
        mainPiece.confirmPositions()
    }


    if ( backupPiece ) {
        var nextUp = backupPiece
        backupPiece = mainPiece
        nextUp.forceAxis(0)
        mainPiece.confirmPositions()
        putNewPiece(nextUp)
    } else {
        backupPiece = mainPiece
        putNewPiece()
    }

    drawBackupPiece()
}

function drawBackupPiece() {

    nextPieceData.forEach( row => {
        row.forEach( column => {
            column.clearBlock()
        })
    })

    backupPiece.effectivePositions.forEach( position => {
        let newBlock = nextPieceData[position[0]][position[1]-1]
        newBlock.fillBlock(backupPiece.id, backupPiece.color)
        backupPiece.blocks.push(newBlock)
    })

    renderBackupArea()
}

function renderBackupArea() {
    let html = '<table cellpadding=0 cellspacing=0>'

    nextPieceData.forEach( row => {
        html+='<tr>'
        row.forEach (block => {
            let color = block.hasPiece? block.color : ''
            let cssClass = block.hasPiece? 'displayFilledTd' : 'displayTd'
            html+= '<td bgcolor="'+ color +'" class="'+cssClass+'"/>'
        })

        html+='</tr>'
    })

    html+="</table>"

    document.querySelector("#nextPieceCanvas").innerHTML = html
}

function drawFollowingPieces() {

    for(let x=0; x<5;x++) {
        let grid = followingPiecesData[x]
        let piece = followingPieces[x]

        if(piece instanceof LINE_piece) {
            piece.forceAxis(1)
            mainPiece.confirmPositions()
        }

        grid.forEach( row => {
            row.forEach( column => {
                column.clearBlock()
            })
        })

        piece.effectivePositions.forEach( position => {
            let newBlock = grid[position[0]][position[1]-1]
            newBlock.fillBlock(piece.id, piece.color)
            piece.blocks.push(newBlock)
        })
    }

    renderFollowingPieces()
}

function renderFollowingPieces() {
    for(let x=0; x<5; x++) {
        let grid = followingPiecesData[x]
        let html = '<table cellpadding=0 cellspacing=0>'

        grid.forEach( row => {
            html+='<tr>'
            row.forEach (block => {
                let color = block.hasPiece? block.color : ''
                let cssClass = block.hasPiece? 'displayFilledTd' : 'displayTd'
                html+= '<td bgcolor="'+ color +'" class="'+cssClass+'"/>'
            })

            html+='</tr>'
        })

        html+="</table>"

        document.querySelector("#next_"+(x+1)).innerHTML = html
    }
}

function runVisualMethods() {
    renderField()
    renderBackupArea()
    drawFollowingPieces()
    renderFollowingPieces()
}

document.getElementById('game_start').addEventListener('click', requestStart)
document.getElementById('controls_btn').addEventListener('click', switchControlsInfoCard)

function switchControlsInfoCard() {
    let controlCard = document.getElementById('controls')
    if(controlCard.style.visibility == "visible") {
        controlCard.style.visibility = "hidden"
    } else {
        controlCard.style.visibility = "visible"
    }
}

function startGame() {
    document.getElementById('game_start').blur()

    // if(gameStatus)
    //     return
    clearInterval(fieldRenderProcess)
    clearInterval(gameProgressProcess)
    console.log('Game is Starting')
    resetVariables()
    runVisualMethods()
    fieldRenderProcess = setInterval(renderField, 17)
    gameProgressProcess = setInterval(gameProgress, 1000)
    moveMainPiece()
}

runVisualMethods()

function getField() {
    return fieldData
}

function useSpell() {
    if (powerCharges!=100)
        return

    //TODO: send spell   
    spell(getRandomSpell()) 
    powerCharges = 0
    document.getElementById('powerBar').style.width = powerCharges +'%' 
    document.getElementById('barMsg').style.visibility = 'hidden'
    document.getElementById('powerBar').style.animationName = ''
}

function useCurse() {
    if (powerCharges!=100)
        return

    //TODO: send curse
    sendCurse(getRandomCurse())
    powerCharges = 0
    document.getElementById('powerBar').style.width = powerCharges +'%' 
    document.getElementById('barMsg').style.visibility = 'hidden'
    document.getElementById('powerBar').style.animationName = ''
    
}

function increasePowerup() {
    if (powerCharges<100) {
        powerCharges+=10
        document.getElementById('powerBar').style.width = powerCharges +'%' 
    } else {
        var bar = document.getElementById('powerBar')
        bar.style.animationName = 'charged'
        bar.style.animationDuration = '2s'
        bar.style.animationIterationCount = 'infinite'

        document.getElementById('barMsg').style.visibility = 'visible'
    }
}

///////////////// SPELLS
const spells = [
    'deep_pockets',
    'blessing'
]

function spell(spellId) {
    switch (spellId) {
        case 'deep_pockets':
            gameSpells['deep_pockets'] = {count: 0}
            setTimeout(removeSpell, 10000, 'deep_pockets')
            break
        case 'blessing':
            blessingSpell()
            break
    }
}

function blessingSpell() {
    var linesWithBlocks = fieldData.slice(1,21).filter( row => row.some(block => block.hasPiece && block.pieceId != mainPiece.id))

    if(linesWithBlocks.length==0) return

    var lineChosen = (Math.floor(Math.random() * linesWithBlocks.length))

    linesWithBlocks[lineChosen] = linesWithBlocks[lineChosen].forEach(
        (block) => {
            block.pieceId = -1 
            block.color = 'white'
            block.isShadow = true
        }
    )

    setTimeout(clearFilledLines, 200);
}

function getRandomSpell() {
    return spells[(Math.floor(Math.random() * spells.length))]
}

function removeSpell(spellId) {
    gameSpells[spellId] = undefined
}


//////////////// CURSES

const curses = [
    '1900',
    'upside_down'
]

function getRandomCurse() {
    return curses[(Math.floor(Math.random() * curses.length))]
}

function curse(curseId) {
    switch (curseId) {
        case '1900':
            darkenPiecesCurse()
            break
        case 'upside_down':
            gameCurses['upside_down'] = true
            setTimeout(removeCurse, 5000, curseId)
            break
    }
}

function removeCurse(curseId) {
    gameCurses[curseId] = undefined
}

function darkenPiecesCurse() {
    fieldData.slice(1,21).forEach( row => {
        row.forEach (block => {
            if(block.hasPiece) {
                block.effects.push({id:'1900'})
            }
        })
    })
    setTimeout(darkenPiecesEndCurse, 10000)

}

function darkenPiecesEndCurse() {
    fieldData.slice(1,21).forEach( row => {
        row.forEach (block => {
            if(block.hasPiece) {
                block.effects = block.effects.filter(effect => effect['id']!='1900')
            }
        })
    })
}


export { increaseEnemyLines, startGame, getField, createOtherFields, renderOtherPlayersFields, increasePowerup, curse};