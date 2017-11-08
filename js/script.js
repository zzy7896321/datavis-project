
barChart = new BarChart();

d3.json("data/us-states.json", function (states) {
    bmap = new Map(states);
    d3.csv("data/joined_table.csv", function (error, banks) {
        let lineChart = new LineChart(barChart, bmap, banks);
        lineChart.update();
    });
});



