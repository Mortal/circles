// vim:set sw=2 sts=2 et:
var canvas, ctx;

function dist(px, py, pt) {
  var dx = pt.x-px, dy = pt.y-py, dxx = dx*dx, dyy = dy*dy, dd = dxx+dyy, d = Math.sqrt(dd);
  return d;
}
function in_circle(px, py, circ) {
  console.log(px, py, circ);
  return dist(px, py, circ) < circ.r;
}

function Canvas() {
  var self = this;
  var canvas = self.canvas = document.getElementById('thecanvas');
  var width = canvas.width = canvas.clientWidth;
  var height = canvas.height = canvas.clientHeight;
  var ctx = self.ctx = canvas.getContext('2d');
  var vertices = self.vertices = [];
  var HANDLERADIUS = 4;
  self.selectedVertex = null;
  self.drawCircle = function (x,y,r,c) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = c || 'black';
    ctx.strokeWidth = 3;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.fill();
    ctx.stroke();
  };
  self.clear = function () {
    ctx.clearRect(0,0,width,height);
  };
  self.redraw = function () {
    self.clear();
    for (var i = 0, l = vertices.length; i < l; ++i) {
      var v = vertices[i];
      if (self.selectedVertex == i) {
        self.drawCircle(v.x, v.y, v.r, 'red');
        self.drawCircle(v.x, v.y, HANDLERADIUS, 'blue');
        self.drawCircle(v.x+v.r, v.y, HANDLERADIUS, 'blue');
      } else {
        self.drawCircle(v.x, v.y, v.r);
      }
    }
  };
  self.addVertex = function (x, y, r) {
    self.vertices.push({x:x,y:y,r:r});
    self.redraw();
  };
  self.selectVertexAt = function (x, y) {
    self.selectedVertex = null;
    for (var i = 0, l = vertices.length; i < l; ++i) {
      var v = vertices[i];
      var dx = v.x-x, dy = v.y-y,
          dxx = dx*dx, dyy = dy*dy,
          rr = v.r*v.r;
      if (dxx > rr || dyy > rr) continue;
      var d = dxx+dyy;
      if (d > rr) continue;
      self.selectedVertex = i;
      break;
    }
    self.redraw();
  };
  self.helloWorld = function () {
    self.addVertex(50,50,10);
    self.selectVertexAt(45,50);
  };
  var fake = {fake:1};
  self.getSelectedVertex = function () {
    if (self.selectedVertex == null) return fake;
    return self.vertices[self.selectedVertex];
  };
  self.moveTo = function (x,y) {
    var v = self.getSelectedVertex();
    v.x = x;
    v.y = y;
    self.redraw();
  };
  self.resizeTo = function (x,y) {
    var v = self.getSelectedVertex();
    v.r = dist(x, y, v);
    self.redraw();
  };
  self.moveHandle = function (x, y) {
    var v = self.getSelectedVertex();
    if (v.fake) return false;
    return in_circle(x, y, {x:v.x, y:v.y, r:HANDLERADIUS});
  };
  self.resizeHandle = function (x, y) {
    var v = self.getSelectedVertex();
    if (v.fake) return false;
    return in_circle(x, y, {x:v.x+v.r, y:v.y, r:HANDLERADIUS});
  };
}
function init() {
  canvas = new Canvas();
  canvas.helloWorld();

  function mousemove_moving(ev) {
    if (!ev) ev = window.event;
    var x = ev.clientX, y = ev.clientY;
    canvas.moveTo(x,y);
  }

  function mousemove_resizing(ev) {
    if (!ev) ev = window.event;
    var x = ev.clientX, y = ev.clientY;
    canvas.resizeTo(x,y);
  }

  var makefrom = {x:0, y:0};
  function mousemove_maybemake(ev) {
    if (!ev) ev = window.event;
    var x = ev.clientX, y = ev.clientY;
    if (dist(x, y, makefrom) > 10) {
      canvas.addVertex(makefrom.x, makefrom.y, 10);
      canvas.selectVertexAt(makefrom.x, makefrom.y);
      window.onmousemove = mousemove_resizing;
    }
  }
  window.onmousedown = function (ev) {
    if (!ev) ev = window.event;
    var x = ev.clientX, y = ev.clientY;
    if (canvas.moveHandle(x, y)) {
      window.onmousemove = mousemove_moving;
    } else if (canvas.resizeHandle(x, y)) {
      window.onmousemove = mousemove_resizing;
    } else {
      canvas.selectVertexAt(x, y);
      if (canvas.selectedVertex == null) {
        window.onmousemove = mousemove_maybemake;
        makefrom.x = x;
        makefrom.y = y;
      } else {
        window.onmousemove = null;
      }
    }
  };
  window.onmouseup = function () {
    window.onmousemove = null;
  };
}
window.onload = init;
