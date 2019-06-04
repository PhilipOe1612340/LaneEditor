const scalingFactor = 1.5;
const lanes = [];
const connections = [];

let wasDragged = false;
let dragConnection = {
  from: undefined,
  section: 0
}

let inputs = {
  start: '',
  destination: '',
  name: 'u1',
  length: 4,
  type: 0,
  time: {
    type: 0,
    value: "",
  },
  trip: {
    start: 'trip start',
    destination: 'trip stop'
  }
}


function setup() {
  createCanvas(1000, 1000);
  let temp = undefined;

  temp = createInput('').input((event) => inputs.trip.start = event.target.value);
  temp.elt.placeholder = 'trip start'
  temp = createInput('').input((event) => inputs.trip.destination = event.target.value);
  temp.elt.placeholder = 'trip destination'

  temp = createInput('').input((event) => inputs.start = event.target.value);
  temp.elt.placeholder = 'Start Station'
  temp = createInput('').input((event) => inputs.destination = event.target.value);
  temp.elt.placeholder = 'Destination Station'
  temp = createInput('').input((event) => inputs.name = event.target.value);
  temp.elt.placeholder = 'Name'
  temp = createInput(0, 'number').input((event) => inputs.length = event.target.value);
  temp.elt.placeholder = 'number of stations'

  const selTime = createSelect();
  selTime.option('no time');
  selTime.option('start time');
  selTime.option('stop time');
  selTime.changed(event => inputs.time.type = event.target.selectedIndex);

  temp = createInput('').input((event) => inputs.time.value = event.target.value);
  temp.elt.placeholder = 'time'

  const sel = createSelect();
  sel.option('green');
  sel.option('orange');
  sel.option('red');
  sel.changed(event => inputs.type = event.target.selectedIndex);

  createButton('create').mousePressed(createLane);
  createButton('save').mousePressed(() => saveCanvas('route', 'jpg'));
  createButton('reconnect').mousePressed(() => {
    lanes.forEach(lane => lane.connections = new WeakSet());
  });
  createButton('clear').mousePressed(() => lanes.splice(0, lanes.length));

}

function draw() {
  background(255);
  smooth();
  scale(scalingFactor);
  lanes.forEach(l => l.drawFootpath(connections))
  lanes.forEach(l => l.drawWaitpath(connections))
  lanes.forEach(l => l.draw())


  if (dragConnection.from) {
    dragConnection.from.drawDragPath(dragConnection.section);
  }

  const tallest = lanes.reduce((l, max) => (l.y + size * l.length) > (max.y + size * max.length) ? l : max, { y: 0, length: 10 });
  const maxHeight = tallest.y + size * tallest.length + 50;

  fill(0);
  stroke(0);
  textSize(22);
  drawingContext.setLineDash([6, 6]);
  line(22, 50, 22, maxHeight);
  drawingContext.setLineDash([]);
  textAlign(LEFT);

  stroke(255);
  text(inputs.trip.start, 20, 40);
  text(inputs.trip.destination, 20, maxHeight + 15);
}


function mouseClicked(event) {
  if (wasDragged) {
    wasDragged = false;
    dragConnection = {};
    return;
  }
  if (event.ctrlKey) {
    const idx = lanes.findIndex(l => l.clicked());
    if (idx > -1) {
      connections.filter(c => c.of === lanes[idx]).forEach(c => removeConnection(lanes[idx], c))
      lanes.splice(idx, 1);
    }
  }
}

function mouseDragged(event) {
  wasDragged = true;
  let s = 0;
  const section = lanes.find(l => {
    s = l.sectionClicked();
    return s > -1;
  });

  if (dragConnection.from) {
    if (section && section !== dragConnection.from) {
      addConnection(dragConnection.from, {
        from: dragConnection.section,
        to: s,
        of: section,
        type: !event.ctrlKey ? 'footpath' : 'waitpath'
      });
      dragConnection = {};
    }
    return;
  }

  if (section && s > 0) {
    dragConnection.from = section;
    dragConnection.section = s;
    return;
  }

  const lane = lanes.find(l => l.clicked());
  if (lane) {
    lane.x = mouseX / scalingFactor - 4;
    lane.y = mouseY / scalingFactor;
  }
}

function createLane() {
  lanes.push(new Lane(inputs.length, inputs.name, inputs.type, inputs.start, inputs.destination, inputs.time.type, inputs.time.value))
}


function addConnection(lane, connection) {
  connections.push(connection);
  lane.connections.add(connection);
}

function removeConnection(lane, connection) {
  connections.splice(connections.findIndex(c => c === connection), 1);
  lane.connections.delete(connection);
}