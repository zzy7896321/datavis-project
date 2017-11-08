let barChart = new BarChart();
let map = new Map();


d3.csv("data/joined_table.csv", function (error, banks) {
    let lineChart = new LineChart(barChart, map, banks);
    lineChart.update();
});

