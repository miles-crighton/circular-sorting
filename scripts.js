var svg = d3.select('#container').append('svg')
    .attr({ 'width': 800, 'height': 800, 'display': 'block', 'margin': 'auto'})
    .append('g')
    .attr('transform', 'translate(400,400)');

var circle = svg.append('g').append('circle').attr({ r: '90px', cx: '0px', cy: '0px', fill: 'red' });

var array, actions, bars;

var barCountInput = document.getElementById('barCount');
var slider = document.getElementById("myRange");

var n = barCountInput.value;
var time = 100;

barCountInput.onchange = () => {
    n = barCountInput.value;
    console.log('New n:', n)
}


var sortType = 0

queueSort = (type) => {
    d3.selectAll('rect').remove();
    array = d3.shuffle(d3.range(n));
    
    switch (type) {
        case 0:
            actions = quickSort(array.slice()).reverse();
            break;
        case 1:
            actions = bubbleSort(array.slice()).reverse();
            break;
        default:
            actions = quickSort(array.slice()).reverse();
    }

    let circleRadius = 100,
        chairOriginX = (circleRadius) * Math.sin(0),
        chairOriginY = (circleRadius) * Math.cos(0);

    bars = svg.append('g')
        .attr('class', 'default-rect')
        .selectAll('rect')
        .data(array)
        .enter().append('rect')
        .attr({
            'width': '5px',
            'rx': 2,
            'height': function (d) { return (d + 5) * 2; },
            'x': () => { return chairOriginX - (5 / 2) },
            'y': () => { return chairOriginY - (5 / 2) },
            'transform': transform
        })
}

function transform(d, i) {
    return 'rotate(' + (i * (360 / n) + 180) + ')';
}

this.queueSort()

var blocked = false;
var activateButton = document.getElementById('activateButton')

var transition = d3.transition()
beginAnimation = () => {
    if (!blocked) {
        blocked = true;
        activateButton.innerText = 'Stop it!'
        var transition = d3.transition()
            .duration(time)
            .each('start', function start() {
                let action = actions.pop();
                //console.log(action)
                switch (action.type) {
                    case 'swap': {
                        bars.attr("class", function (d, i) {
                            return i === action[0] || i === action[1] ? 'active-rect' : 'default-rect'
                        });
                        var i = action[0],
                            j = action[1],
                            bari = bars[0][i],
                            barj = bars[0][j];
                        bars[0][i] = barj
                        bars[0][j] = bari
                        transition.each(function () { bars.transition().attr('transform', transform) })
                        break;
                    }
                }
                if (actions.length) transition = transition.transition().each('start', start);
                else transition.each('end', function () { bars.attr("class", 'default-rect'); blocked = false; });
            })

        slider.oninput = () => {
            time = slider.value
            console.log(time)
            transition.duration(time);
        }
    } else {
        blocked = false;
        activateButton.innerText = 'Start it!'
        d3.select("bars").transition();
    }
}


function quickSort(array) {
    var actions = [];

    function partition(left, right, pivot) {
        var v = array[pivot];
        swap(pivot, --right);
        for (var i = left; i < right; ++i) if (array[i] <= v) swap(i, left++);
        swap(left, right);
        return left;
    }

    function swap(i, j) {
        if (i === j) return;
        var t = array[i];
        array[i] = array[j];
        array[j] = t;
        actions.push({ type: "swap", "0": i, "1": j });
    }

    function recurse(left, right) {
        if (left < right - 1) {
            var pivot = (left + right) >> 1;
            actions.push({ type: "partition", "left": left, "pivot": pivot, "right": right });
            pivot = partition(left, right, pivot);
            recurse(left, pivot);
            recurse(pivot + 1, right);
        }
    }

    recurse(0, array.length);
    return actions;
}

function bubbleSort(array) {
    var actions = [];
    var keepBubbling = true;

    while (keepBubbling) {
        keepBubbling = false;
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i] > array[i + 1]) {
                swap(i, i + 1);
                keepBubbling = true;
            }
        }
    }

    function swap(i, j) {
        if (i === j) return;
        var t = array[i];
        array[i] = array[j];
        array[j] = t;
        actions.push({ type: "swap", "0": i, "1": j });
    }

    return actions
}