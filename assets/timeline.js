var data = [
  {
    date: new Date(2024, 7, 8), 
    name:'Jensen'
  },
  {
    date: new Date(2024, 7, 9), 
    name:'Decision vs Outcome',
  },
  {
    date: new Date(2025, 12, 18), 
    name:'The future is today',
  },
];

var options =   {
  margin: {left: 20, right: 20, top: 20, bottom: 20},
  initialWidth: 500,
  initialHeight: 1000,
};

var innerWidth =  options.initialWidth - options.margin.left - options.margin.right;
var innerHeight = options.initialHeight - options.margin.top - options.margin.bottom;
var colorScale = d3.scale.category10();

var vis = d3.select('#timeline')
  .append('svg')
  .attr('width',  options.initialWidth)
  .attr('height', options.initialHeight)
  .append('g')
  .attr('transform', 'translate('+(options.margin.left)+','+(options.margin.top)+')');

function labelText(d){
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
    const day = d.date.getDate();
    const year = d.date.getFullYear()
    const month = monthNames[d.date.getMonth()];
    return `${day} ${month} ${year}` + ' - ' + d.name;
}



var dummyText = vis.append('text');

var timeScale = d3.time.scale()
  .domain(d3.extent(data, function(d){return d.date;}))
  .range([0, innerHeight])
  .nice();

var nodes = data.map(function(movie){
  var bbox = dummyText.text(labelText(movie))[0][0].getBBox();
  movie.h = bbox.height;
  movie.w = bbox.width;
  return new labella.Node(timeScale(movie.date), movie.h + 4, movie);
});

dummyText.remove();

vis.append('line')
  .classed('timeline', true)
  .attr('y2', innerHeight);

var linkLayer = vis.append('g');
var labelLayer = vis.append('g');
var dotLayer = vis.append('g');

dotLayer.selectAll('circle.dot')
  .data(nodes)
  .enter().append('circle')
  .classed('dot', true)
  .attr('r', 3)
  .attr('cy', function(d){return d.getRoot().idealPos;});

function color(d,i){
  return '#1D1F20';
}

var renderer = new labella.Renderer({
  layerGap: 60,
  nodeHeight: nodes[0].width,
  direction: 'right'
});

function draw(nodes){
  renderer.layout(nodes);

  var sEnter = labelLayer.selectAll('rect.flag')
    .data(nodes)
    .enter().append('g')
    .attr('transform', function(d){return 'translate('+(d.x)+','+(d.y-d.dy/2)+')';});

  sEnter
    .append('rect')
    .classed('flag', true)
    .attr('width', function(d){ return d.data.w + 9; })
    .attr('height', function(d){ return d.dy; })
    .attr('rx', 2)
    .attr('ry', 2)
    .style('fill', color);

  // sEnter
  //   .append('text')
  //   .attr('x', 4)
  //   .attr('y', 15)
  //   .style('fill', '#D4F6F0')
  //   .text(function(d){return labelText(d.data);});
  sEnter
    .append('a')
    .attr('xlink:href', function(d) {
      
      const fileName = d.data.name.replace(/\s+/g, '_').toLowerCase() + '.html';
      return 'posts/' + encodeURIComponent(fileName);
      // return d.link + encodeURIComponent(d.data.name); // Customize this as needed
    })
    // .attr('target', '_blank') // Open link in new tab
    .append('text')
    .attr('x', 4)
    .attr('y', 15)
    .style('fill', '#D4F6F0')
    .text(function(d){return labelText(d.data);});

  linkLayer.selectAll('path.link')
    .data(nodes)
    .enter().append('path')
    .classed('link', true)
    .attr('d', function(d){return renderer.generatePath(d);})
    .style('stroke', color)
    .style('stroke-width',2)
    .style('opacity', 0.6)
    .style('fill', 'none');
}

var force = new labella.Force({
  minPos: -10
})
  .nodes(nodes)
  .compute();

draw(force.nodes());
