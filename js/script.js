
d3.json("data/us-states.json", function (states) {
    d3.csv("data/joined_table.csv", function (error, banks) {
        for (let bank of banks) {
            bank.lat = +bank.lat;
            bank.lng = +bank.lng;
        }
        let bdate = "Effective Date";
        //console.log(thistable.banks[bdate]);
        for(let i = 0; i < banks.length; i++){
            let parsedate = banks[i][bdate].split("/");
            banks[i].efyear = +parsedate[2];
        }

        //sort by year
        banks.sort(function (a,b) {
            return a.efyear - b.efyear;
        });
        bmap = new Map(states, banks);
        barChart = new BarChart(banks);
        lineChart = new LineChart(barChart, bmap, banks);
        lineChart.update('bank_amounts');
    });
});

function changeData() {

    let choosedata = document.getElementById("dataset").value;
    lineChart.update(choosedata);
}



