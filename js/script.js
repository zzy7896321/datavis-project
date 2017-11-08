
let barChart = new BarChart();
let map = new Map();
let lineChart = new LineChart(barChart, map);

d3.csv("data/joined_table.csv", function (error, electionWinners) {
    lineChart.update(electionWinners);
});

