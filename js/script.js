    //load data
    d3.csv("data/joined_table.csv", function (error, electionWinners) {
        let yearChart = new YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners);
        yearChart.update();
    });