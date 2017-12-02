
d3.json("data/us-states.json", function (states) {
    d3.csv("data/joined_table.csv", function (error, banks) {
        let bdate = "Effective Date";
        for(let i = 0; i < banks.length; i++){
            banks[i].lat = +banks[i].lat;
            banks[i].lng = +banks[i].lng;
            let parsedate = banks[i][bdate].split("/");
            banks[i].efyear = +parsedate[2];
            banks[i].lowerName = banks[i]["Institution Name"].toLowerCase();
            banks[i].locationId = banks[i]["Location"].replace(", ", "-")
                .replace(" ", "_");
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

