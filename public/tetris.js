


const canvas = document.getElementById('tetris')
const ctx = canvas.getContext('2d')

ctx.scale(20,20)
let randomFirst = Math.floor(Math.random()* 7)
let randomSecond = Math.floor(Math.random()* 4)

let choosePiece = PIECES[randomFirst][randomSecond]
let piecePos = {
    x: 5,
    y: 0
}

let moveDown = 0
let color = chooseColor()
let score = 0
let email = ''
let counter = true
let pause_button = document.querySelector('.pause_button')
let thumbnail_image = document.querySelector('.thumbnail_image')

function pauseGame (){
    counter = !counter
}

pause_button.addEventListener('click',pauseGame)

fetch('/api/info',{
    "Content-Type": "application/json"
},).then(i=>i.json()).then(user=>{
    let welcome = document.querySelector('.welcome-message')
    let high_score = document.querySelector('.high_score')
    welcome.innerHTML = `Welcome ${user.name}`
    email = user.username
    if(Math.max(...user.scores)===-Infinity){
        high_score.innerHTML = `High Score - 0`
    }else{
        high_score.innerHTML = `High Score - ${Math.max(...user.scores)}`
    }
    if(user.thumbnail!=='n/a'){
        thumbnail_image.src = user.thumbnail
    }else{
        thumbnail_image.src = user.thumbnail = '/images/account_friend_human_man_member_person_profile_user_users-512.webp'
    }
})

function reload(){
    window.location.reload()
}

function saveScore (){

}


function followScore (){
    let display_score = document.querySelector('.display_score')
    display_score.innerHTML = `Score : ${score}`
}

function draw (matrix,offset){

    if(matrix===undefined){
        randomSecond = 0
        choosePiece = PIECES[randomFirst][randomSecond]
        matrix.forEach((row,y)=>{
            row.forEach((value,x)=>{
                if(value!==0){
                    ctx.fillStyle = color
                    ctx.fillRect(offset.x + x, offset.y + y,1,1)
                }
            })
        })
    }else{
        matrix.forEach((row,y)=>{
            row.forEach((value,x)=>{
                if(value!==0){
                    ctx.fillStyle =color
                    ctx.fillRect(offset.x + x, offset.y + y,1,1)
                }
            })
        })
    }  
}

const arena = createMatrix(20,27)



function createMatrix(w,h){
    const matrix = []
    while(h--){
        matrix.push(new Array(w).fill(0))
    }
    return matrix
}

function merge(arena,player){
    choosePiece.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value!==0){
                if(arena[y+player.y]===undefined){
                    let checkScore = prompt(`Game Over. Save Score? Enter description. `)
                    if(checkScore!==null){
                        $.post('/api/scores',{
                            username: email,
                            current: score,
                            description: checkScore
                        },window.location.reload())
                    }else{
                        window.location.reload()
                    }

                }else{
                    arena[y+player.y][x+player.x] = value
                }
            }
        })
    })
}

let lastTime = Date.now()
function dropCounter (time=0){
    let counter = Date.now() - lastTime
    if(counter > 500){
        piecePos.y ++ 
        lastTime = Date.now()

    }
}

(function update (){

    window.setInterval(()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height)
        draw(arena,{x:0,y:0})
        draw(choosePiece,piecePos)
        if(counter){
            dropCounter()
            pause_button.innerHTML = `PAUSE`
        }else{
            pause_button.innerHTML = `START`
        }
        if(choosePiece!==undefined){
            if(collide(arena,piecePos)){
                piecePos.y --
                merge(arena,piecePos)
                newPiece()
                piecePos.y = 0
                color = chooseColor()
                clearRow()
            }
        }
    })

}())

function chooseColor (){
    let symbols = ["#6B5B95","#FF6F61","#D65076","#EFC050","#9B2335","#E15D44","#C3447A"]

    return symbols[Math.round(Math.random()*5)]
}

function playerMove (dir){
    piecePos.x += dir;
    if(collide(arena,piecePos)){
        piecePos.x -= dir
    }
}
function playerRotate(dir){
    const pos = piecePos.x
    let offset = 1
    rotate(choosePiece,dir)
    while(collide(arena,piecePos)){
        piecePos.x += offset
        offset = -(offset + (offset >  0? 1 : -1))
        if(offset>choosePiece[0].length){
            rotate(choosePiece,-dir);
            piecePos.x = pos
            return
        }
    }
}

function rotate(matrix,dir){
    for(let i= 0;i<matrix.length;i++){
        for(let j=0;j<i;j++){
            [
                matrix[j][i],
                matrix[i][j],
            ] = [
                matrix[i][j],
                matrix[j][i]
            ];
        }
    }
    if(dir>0){
        matrix.forEach(row=>row.reverse())
    }else{
        matrix.reverse()
    }
}

function newPiece (){
    piecePos.x = 5
    piecePos.y = 0
    randomFirst = Math.floor(Math.random()* 7)
    randomSecond = Math.floor(Math.random()* 4)
    choosePiece = PIECES[randomFirst][randomSecond]
    if(choosePiece===undefined){
        randomSecond = 0
        choosePiece = PIECES[randomFirst][randomSecond]
    }
}


function collide(arena,player){
    if(arena!== undefined){
        const [m,o]= [choosePiece,piecePos]
        for(let y=0;y<m.length;y++){
            for(let x=0;x<m[y].length;x++){
                if(m[y][x]!==0 && (arena[y+o.y] && arena[y+o.y][x+ o.x])!==0){
                    return true
                }
            }
        }
        return false
    }
}

function clearRow(){
    let rowsCounted = 1
    outer: for(let y = arena.length - 1; y>0; y--){
        for(let x = 0; x<arena[y].length;x++){
            if(arena[y][x]===0){
                continue outer;
            }
        }
        const row = arena.splice(y,1)[0].fill(0)
        arena.unshift(row)
        score += rowsCounted * 10
        rowsCounted *= 2
        followScore()
        y++
    }
}

window.addEventListener('keydown',(e)=>{
    if(e.keyCode===37){
        playerMove(-1)
    }else if(e.keyCode === 39){
        playerMove(+1)
    }else if(e.keyCode===38){
        playerRotate(-1)
    }else if(e.keyCode===40){
        moveDown=0
        piecePos.y ++
        counter = true
        lastTime = Date.now()
        if(choosePiece!==undefined){
            if(collide(arena,piecePos)){
                piecePos.y --
                merge(arena,piecePos)
                newPiece()
                piecePos.y = 0
                color = chooseColor()
                clearRow()
            }
        }
    }
})



