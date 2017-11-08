let barChart = new BarChart();
let bmap = new Map();


d3.csv("data/joined_table.csv", function (error, banks) {
    let lineChart = new LineChart(barChart, bmap, banks);
    lineChart.update();
});

