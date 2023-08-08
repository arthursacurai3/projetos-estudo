// criar um array com a qtd de elementos a partir do config
// cada elemento recebe 0 ou 1 randomicamente até atingir 1/3 da qtd total de elementos
// for each em cada elemento para construir o html

const $initBoard = document.querySelector('#choose-size')
const $size = document.querySelector('select')
const $board = document.querySelector('ul')
const $signals = document.getElementsByClassName('signal')
const $housesOpened = document.getElementsByClassName('open')
let size = 0
let boardObj = {}
let qtdBomb = 0
let bombsIndicators = []
let neutralZones = {}
let maxZone = 1
let minZone = 0
let cornersIdx = []
let topIdx = []
let bottomIdx = []
let rightIdx = []
let leftIdx = []
let middleIdx = []
let regexRight = /\d?[9]$/
let regexLeft = /\d?[0]$/
let createdZones = []
let columns = 0
let houseOpens = 0
let openedAreas = []

const $radioBtns = document.querySelector('fieldset')
console.log($radioBtns.firstElementChild)

let savedTheme = localStorage.getItem('theme')
if (!savedTheme) {
    $radioBtns.querySelector('input').checked = true
} else {
    applyTheme(savedTheme)
}

$radioBtns.addEventListener('click', e => {
    if (e.target.nodeName == 'INPUT') {
        localStorage.setItem('theme', e.target.getAttribute('id'))
    }
})

function applyTheme(theme) {
    $radioBtns.querySelector(`#${savedTheme}`).checked = true
}

let lastSize = sessionStorage.getItem('lastSize')
lastSize ? $size.value = lastSize : ''

$initBoard.addEventListener('submit', function (e) {

    e.preventDefault()
    createBoard()

    sessionStorage.setItem('lastSize', size)
})

$board.addEventListener('click', e => {
    const elem = e.target
    console.log(elem)
    if (elem.getAttribute('bomb') == '') {
        elem.removeAttribute('displaynone')
        elem.setAttribute('style','background-color: red;')
        setTimeout(() => {
            if (window.confirm('VOCÊ PERDEU!!!')) {
                createBoard()
            }
        }, 200)
    } else if(!e.target.classList.contains('open')){
        let area = elem.getAttribute('area')

        if (area !== '' && !openedAreas.includes(area)) {
            openedAreas.push(area)
            openArea(area)
        } else {
            elem.classList.add('open')
            elem.removeAttribute('displaynone')
        }
    }
    checkWin()
})

$board.addEventListener('contextmenu', e => {
    e.preventDefault()
    markAsBomb(e.target)
    checkWin()
})

function markAsBomb(_this){
    _this.classList.toggle('signal')
}

function createBoard() {
    size = parseInt($size.value)
    qtdBomb = 0
    boardObj = {}
    neutralZones = {}
    maxZone = 1
    topIdx = []
    bottomIdx = []
    rightIdx = []
    leftIdx = []
    middleIdx = []
    cornersIdx = []
    createdZones = []

    const board = document.querySelector('.board')
    board.innerHTML = ''
    columns = Math.sqrt(size)

    cornersIdx = [0, columns - 1, size - columns, size - 1]

    bombDistribution()
    bombsIndicator()
    checkNeutralZones()

    renderBoard()
}

function bombDistribution() {
    let i = 0

    while (qtdBomb < (size / 10)) {
        if (boardObj[i] == undefined || boardObj[i] == 0 || boardObj[i] !== 'B') {
            let bomb = Math.round(Math.random() * 10)
            if (bomb == 1) {
                boardObj[i] = 'B'
                qtdBomb++
            } else {
                boardObj[i] = ''
            }
        }

        i == size - 1 ? i = 0 : i++
    }
}

function renderBoard() {
    $board.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    grid-template-rows: repeat(${columns}, 1fr)
    `)
    let qtdRows = 0

    for (let i = 0; i < size; i++) {

        const value = boardObj[i]
        const house = document.createElement('li')
        let color = ''



        house.setAttribute('id', i)
        house.setAttribute('displayNone', '')
        house.setAttribute('area', neutralZones[i] || '')
        house.classList.toggle('house')

        if (value == '') {
            house.classList.toggle('neutral')
        } else if (value == 'B') {
            house.setAttribute('bomb', '')
        } else {
            switch (value) {
                case 1:
                    color = '#1D007F';
                    break;
                case 2:
                    color = '#7400C4';
                    break;
                case 3:
                    color = '#BA00C4';
                    break;
                case 4:
                    color = '#8B004B';
                    break;
                case 5:
                    color = '#5D0003';
                    break;
                case 6:
                    color = '#1E0001';
                    break;
                default:
                    break
            }
        }
        house.textContent = value == '' ? '' : value
        $board.appendChild(house)


        if (color != '') {
            house.setAttribute('style', `color: ${color}`)
        }
    }

}

function bombsIndicator() {
    let qtdBomb = 0
    const bordas = {
        top: function (i) {
            qtdBomb = 0
            if (boardObj[i - 1] == 'B') { qtdBomb++ }
            if (boardObj[i + 1] == 'B') { qtdBomb++ }
            if (boardObj[i + columns - 1] == 'B') { qtdBomb++ }
            if (boardObj[i + columns] == 'B') { qtdBomb++ }
            if (boardObj[i + columns + 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }

        },
        bottom: function (i) {
            qtdBomb = 0
            if (boardObj[i - 1] == 'B') { qtdBomb++ }
            if (boardObj[i + 1] == 'B') { qtdBomb++ }
            if (boardObj[i - columns - 1] == 'B') { qtdBomb++ }
            if (boardObj[i - columns] == 'B') { qtdBomb++ }
            if (boardObj[i - columns + 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }
        },
        right: function (i) {
            qtdBomb = 0
            if (boardObj[i - columns - 1] == 'B') { qtdBomb++ }
            if (boardObj[i - columns] == 'B') { qtdBomb++ }
            if (boardObj[i - 1] == 'B') { qtdBomb++ }
            if (boardObj[i + columns] == 'B') { qtdBomb++ }
            if (boardObj[i + columns - 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }

        },

        left: function (i) {
            qtdBomb = 0
            if (boardObj[i - columns + 1] == 'B') { qtdBomb++ }
            if (boardObj[i - columns] == 'B') { qtdBomb++ }
            if (boardObj[i + 1] == 'B') { qtdBomb++ }
            if (boardObj[i + columns] == 'B') { qtdBomb++ }
            if (boardObj[i + columns + 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }
        }
    }

    const corners = {
        topLeft: (i) => {
            qtdBomb = 0
            if (boardObj[1] == 'B') { qtdBomb++ }
            if (boardObj[columns] == 'B') { qtdBomb++ }
            if (boardObj[columns + 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }

        },
        topRight: (i) => {
            qtdBomb = 0
            if (boardObj[columns - 2] == 'B') { qtdBomb++ }
            if (boardObj[columns + columns - 2] == 'B') { qtdBomb++ }
            if (boardObj[columns + columns - 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }
        },
        bottomLeft: (i) => {
            qtdBomb = 0
            if (boardObj[size - columns + 1] == 'B') { qtdBomb++ }
            if (boardObj[size - columns - columns] == 'B') { qtdBomb++ }
            if (boardObj[size - columns - columns + 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }
        },
        bottomRight: (i) => {
            qtdBomb = 0
            if (boardObj[size - 1 - 1] == 'B') { qtdBomb++ }
            if (boardObj[size - 1 - columns] == 'B') { qtdBomb++ }
            if (boardObj[size - 1 - columns - 1] == 'B') { qtdBomb++ }

            if (qtdBomb !== 0) {
                boardObj[i] = qtdBomb
                bombsIndicators.push(i)
            } else {
                boardObj[i] = ''
            }
        }

    }

    for (let i = 0; i < size; i++) {
        if (!cornersIdx.includes(i)) {
            if (1 <= i && i < columns - 1 && boardObj[i] !== 'B') {
                bordas.top(i)
                topIdx.push(i)
            } else if (size - columns < i && i < size - 1 && boardObj[i] !== 'B') {
                bordas.bottom(i)
                bottomIdx.push(i)
            } else if (i % columns == (columns - 1) && boardObj[i] !== 'B') {
                bordas.right(i)
                rightIdx.push(i)
            } else if ((i % columns == 0) && boardObj[i] !== 'B') {
                bordas.left(i)
                leftIdx.push(i)
            } else {
                if (boardObj[i] !== 'B') {
                    let qtdBomb = 0

                    if (boardObj[i - columns - 1] == 'B') { qtdBomb++ }
                    if (boardObj[i - columns] == 'B') { qtdBomb++ }
                    if (boardObj[i - columns + 1] == 'B') { qtdBomb++ }

                    if (boardObj[i - 1] == 'B') { qtdBomb++ }
                    if (boardObj[i + 1] == 'B') { qtdBomb++ }

                    if (boardObj[i + columns - 1] == 'B') { qtdBomb++ }
                    if (boardObj[i + columns] == 'B') { qtdBomb++ }
                    if (boardObj[i + columns + 1] == 'B') { qtdBomb++ }

                    if (qtdBomb !== 0) {
                        boardObj[i] = qtdBomb
                        bombsIndicators.push(i)
                    } else {
                        boardObj[i] = ''
                    }
                    middleIdx.push(i)
                }
            }
        } else if (cornersIdx.includes(i)) {
            switch (i) {
                case 0:
                    corners.topLeft(i)
                    break
                case (columns - 1):
                    corners.topRight(i)
                    break
                case (size - columns):
                    corners.bottomLeft(i)
                    break
                case (size - 1):
                    corners.bottomRight(i)
                    break
                default:
                    console.log('não existe esse caso')
            }
        }
    }
}

function checkNeutralZones() {
    const bordas = {
        top: function (i) {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                four: neutralZones[i - 1],
                six: neutralZones[i + 1],
                eight: neutralZones[i + columns]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five

            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }

        },
        bottom: function (i) {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                two: neutralZones[i - columns],
                four: neutralZones[i - 1],
                six: neutralZones[i + 1]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five
            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }

        },
        right: function (i) {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                two: neutralZones[i - columns],
                four: neutralZones[i - 1],
                eight: neutralZones[i + columns]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five
            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }
        },

        left: function (i) {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                two: neutralZones[i - columns],
                six: neutralZones[i + 1],
                eight: neutralZones[i + columns]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five
            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }
        }
    }

    const corners = {
        topLeft: (i) => {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                six: neutralZones[i + 1],
                eight: neutralZones[i + columns]
            }


            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five

            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }

        },
        topRight: (i) => {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                four: neutralZones[i - 1],
                eight: neutralZones[i + columns]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five

            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }
        },
        bottomLeft: (i) => {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                two: neutralZones[i - columns],
                six: neutralZones[i + 1]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five
            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }
        },
        bottomRight: (i) => {
            let five = neutralZones[i] || maxZone
            let arrChanges = []
            let neutralsHouseAround = 0

            let around = {
                two: neutralZones[i - columns],
                four: neutralZones[i - 1]
            }

            for (const property in around) {
                if (around[property]) {
                    neutralsHouseAround++
                    if (around[property] < five) {
                        five = around[property]
                        arrChanges.push(five)
                    } else if (around[property] > five) {
                        arrChanges.push(around[property])
                    }
                }
            }
            if (neutralsHouseAround == 0) { maxZone++ }
            neutralZones[i] = five
            if (arrChanges.length !== 0) {
                changeZone(five, arrChanges)
            }
        }

    }

    for (let i = 0; i < size; i++) {
        if (boardObj[i] == '') {
            if (topIdx.includes(i)) {
                bordas.top(i)
            } else if (bottomIdx.includes(i)) {
                bordas.bottom(i)
            } else if (rightIdx.includes(i)) {
                bordas.right(i)
            } else if (leftIdx.includes(i)) {
                bordas.left(i)
            } else if (cornersIdx.includes(i)) {
                switch (i) {
                    case 0:
                        corners.topLeft(i)
                        break
                    case (columns - 1):
                        corners.topRight(i)
                        break
                    case (size - columns):
                        corners.bottomLeft(i)
                        break
                    case (size - 1):
                        corners.bottomRight(i)
                        break
                    default:
                        console.log('não existe esse caso')
                }
            } else {
                let five = neutralZones[i] || maxZone
                let arrChanges = []
                let neutralsHouseAround = 0
                let around = {
                    two: neutralZones[i - columns],
                    four: neutralZones[i - 1],
                    six: neutralZones[i + 1],
                    eight: neutralZones[i + columns]
                }

                for (const property in around) {
                    if (around[property]) {
                        if (around[property] < five) {
                            five = around[property]
                            arrChanges.push(five)
                            neutralsHouseAround++
                        } else if (around[property] > five) {
                            arrChanges.push(around[property])
                        }
                    }
                }
                if (neutralsHouseAround == 0) { maxZone++ }
                neutralZones[i] = five


                if (arrChanges.length !== 0) {
                    changeZone(five, arrChanges)
                }
            }
        }
    }
}

function changeZone(newZone, oldZones) {
    for (const property in neutralZones) {
        if (oldZones.includes(neutralZones[property])) {
            neutralZones[property] = newZone
        }
    }
}

function checkNearNeutralArea(area) {

    bombsIndicators.forEach(el => {
        if (el % columns == 0) {
            let around = {
                two: neutralZones[el - columns],
                three: neutralZones[el - columns + 1],
                six: neutralZones[el + 1],
                eight: neutralZones[el + columns],
                nine: neutralZones[el + columns + 1]
            }

            for (const property in around) {
                if (around[property] == area) {
                    const elem = document.getElementById(`${el}`)
                    elem.removeAttribute('displaynone')
                    elem.classList.add('open')
                }
            }

        } else if (el % columns == (columns - 1)) {
            let around = {
                one: neutralZones[el - columns - 1],
                two: neutralZones[el - columns],
                four: neutralZones[el - 1],
                seven: neutralZones[el + columns - 1],
                eight: neutralZones[el + columns]
            }

            for (const property in around) {
                if (around[property] == area) {
                    const elem = document.getElementById(`${el}`)
                    elem.removeAttribute('displaynone')
                    elem.classList.add('open')
                }
            }

        } else {
            let around = {
                one: neutralZones[el - columns - 1],
                two: neutralZones[el - columns],
                three: neutralZones[el - columns + 1],
                four: neutralZones[el - 1],
                six: neutralZones[el + 1],
                seven: neutralZones[el + columns - 1],
                eight: neutralZones[el + columns],
                nine: neutralZones[el + columns + 1]
            }

            for (const property in around) {
                if (around[property] == area) {
                    const elem = document.getElementById(`${el}`)
                    elem.removeAttribute('displaynone')
                    elem.classList.add('open')
                }
            }
        }
    })
}

function openArea(area) {
    checkNearNeutralArea(area)

    let clearArea = document.querySelectorAll(`[area="${area}"]`)
    clearArea.forEach(el => {
        el.removeAttribute('displaynone')
        el.classList.add('open')
        
    })
}

function checkWin() {
    const houseOpens = document.querySelectorAll('.open').length
    console.log('here')
    console.log({
        size,
        opens: (houseOpens + qtdBomb)
    })
    if (size === (houseOpens + qtdBomb)) {

        setTimeout(() => {
            if (window.confirm('VOCÊ GANHOU!!!')) {
                createBoard()
            }
        }, 200)
    }
}