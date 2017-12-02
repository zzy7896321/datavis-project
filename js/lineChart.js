class LineChart{

    constructor(barChart, bmap, banks){
        let thistable = this;

        this.barChart = barChart;
        this.bmap = bmap;
        this.banks = banks;
        this.list_of_years = [];
        this.whole_years = [];
        this.choosedata = "bank_amounts";

        //console.log(this.banks[0].efyear);
        for(let i =0; i < this.banks.length; i++){
            if(!this.whole_years.includes(this.banks[i].efyear)){
                this.whole_years.push(this.banks[i].efyear);
            }
        }

        this.margin = {top: 10, right: 20, bottom: 30, left: 100};
        let divlineChart = d3.select("#line-chart");
        let svgBounds = divlineChart.node().getBoundingClientRect();
        this.svgwidth = svgBounds.width;// - this.margin.left - this.margin.right;
        this.svgHeight = 250;

        this.svg = divlineChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);

        this.bmap.update(this.whole_years);
        this.barChart.update(this.whole_years, "bank_amounts");

        d3.select("#reset-button").on("click", function () {
            thistable.list_of_years = [];
            d3.selectAll(".selected").classed("selected", false);
            thistable.bmap.update(thistable.whole_years);
            thistable.barChart.update(thistable.whole_years, thistable.choosedata);
        });
    }
    
    update(choosedata){
        //console.log(this.list_of_years);
        //this.bmap.update(this.banks);
        //this.barChart.update(this.banks);
        let thistable = this;

        //console.log(choosedata);
        this.choosedata = choosedata;
        console.log(thistable.banks);

        //aggregation
        let aggrebanks = [];
        let k = 0;
        let j = 0;
        for(let i = 0; i < thistable.banks.length; i++){
            if(choosedata !== 'bank_amounts'){
                thistable.banks[i][choosedata] = thistable.banks[i][choosedata].replace(new RegExp(',', 'g'), '');
            }
            if(i === thistable.banks.length -1){
                aggrebanks.push({});
                aggrebanks[k].efyear = +thistable.banks[i].efyear;
                if(choosedata === 'bank_amounts'){
                    aggrebanks[k].amount = j+1;
                }else{
                    //console.log(thistable.banks[i][choosedata]);
                    aggrebanks[k][choosedata]= j + +thistable.banks[i][choosedata];
                }
                k++;
                j = 0;
            }else{
                if(thistable.banks[i].efyear === thistable.banks[i+1].efyear){
                    if(choosedata === 'bank_amounts'){
                        j++;
                    }else{
                        j = j + +thistable.banks[i][choosedata];
                        //console.log(typeof j);
                        //console.log(thistable.banks[i][choosedata]);
                    }
                }else{
                    aggrebanks.push({});
                    aggrebanks[k].efyear = +thistable.banks[i].efyear;
                    if(choosedata === 'bank_amounts'){
                        aggrebanks[k].amount = j+1;
                    }else{
                        aggrebanks[k][choosedata] = j + +thistable.banks[i][choosedata];
                    }
                    k++;
                    while(+thistable.banks[i+1].efyear !== aggrebanks[k-1].efyear +1){
                        //console.log([+thistable.banks[i+1].efyear, aggrebanks[k-1].efyear + 1]);
                        aggrebanks.push({});
                        aggrebanks[k].efyear = aggrebanks[k-1].efyear + 1;
                        if(choosedata === 'bank_amounts'){
                            aggrebanks[k].amount = 0;
                        }else{
                            aggrebanks[k][choosedata] = 0;
                        }
                        k++;
                    }
                    j = 0;
                }
            }
        }
        for(let i = 0; i < aggrebanks.length-1; i++){
            if(choosedata === 'bank_amounts'){
                aggrebanks[i].nextval = aggrebanks[i+1].amount;
            }else{
                aggrebanks[i].nextval = aggrebanks[i+1][choosedata];
            }

        }
        aggrebanks[aggrebanks.length-1].nextval = null;
        console.log(aggrebanks);

        //scale
        this.xScale = d3.scaleLinear()
            .domain([(+d3.min(aggrebanks,d=>d.efyear)) - 1,(+d3.max(aggrebanks,d=>d.efyear)) + 1])
            .range([this.margin.left, this.svgwidth - this.margin.right]);
        if(choosedata === 'bank_amounts'){
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(aggrebanks, d => d.amount)])
                .range([thistable.svgHeight - this.margin.bottom, this.margin.top]).nice();
        }else {
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(aggrebanks, d => d[choosedata])])
                .range([thistable.svgHeight - this.margin.bottom, this.margin.top]).nice();
        }

        //console.log(thistable.banks.length);

        //clear
        //thistable.svg.select("#lines").html();
        //thistable.svg.select("#circles").html();

        // Create the axes
        this.svg.html("");
        let xAxis = d3.axisTop().tickFormat(d3.format("d"));
        xAxis.scale(thistable.xScale);
        this.svg.append("g").attr("id","linexAxis");
        this.svg.append("g").attr("id","lineyAxis");
        d3.select("#linexAxis")
            .attr("transform", "translate(0," + (+thistable.svgHeight-this.margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0,25)")
            .classed("axis-ticks", true);
        let yAxis = d3.axisLeft();
        if (choosedata != "bank_amounts") {
            yAxis.tickFormat(d3.formatPrefix(".0", 1e6));
        }
        yAxis.scale(thistable.yScale);
        d3.select("#lineyAxis")
            .attr("transform", "translate(" + thistable.margin.left + ", 0)")
            .call(yAxis)
            .selectAll("text")
            .classed("axis-ticks", true);

        //create lines
        this.svg.append("g").attr("id","lines");
        d3.select("#lines").html("").selectAll("line").data(aggrebanks)
            .enter()
            .filter(d => d.nextval !== null)
            .append("line")
            .attr("x1",function (d) {
                return thistable.xScale(d.efyear);
            })
            .attr("y1",function (d) {
                if(choosedata === 'bank_amounts'){
                    return thistable.yScale(d.amount);
                }else {
                    return thistable.yScale(d[choosedata]);
                }

            })
            .attr("x2",function (d) {
                return thistable.xScale(+d.efyear + 1);
            })
            .attr("y2",function (d) {
                //console.log(d.nextval);
                return thistable.yScale(d.nextval);
            })
            .classed("lineChart",true);
        this.svg.append("g").attr("id","circles");
        d3.select("#circles").html("").selectAll("circle").data(aggrebanks)
            .enter()
            .append("circle")
            .attr("r",5)
            .attr("cx",function (d) {
                return thistable.xScale(d.efyear);
            })
            .attr("cy",function (d) {
                if(choosedata === 'bank_amounts'){
                    return thistable.yScale(d.amount);
                }else {
                    return thistable.yScale(d[choosedata]);
                }

            })
            .attr("class",function (d) {
                if(thistable.list_of_years.includes(d.efyear)){
                    return "selected";
                }
            });

        // response to click
        //console.log(whole_years);
        //this.bmap.update(whole_years);
        d3.selectAll("#circles > circle").on("click",function () {
            let selected = d3.select(this);
            if(!thistable.list_of_years.includes(selected.datum().efyear)){
                selected.classed("selected",true);
                thistable.list_of_years.push(selected.datum().efyear);
            }else {
                selected.classed("selected",false);
                thistable.list_of_years = thistable.list_of_years.filter(function (t) { return t !== selected.datum().efyear });
            }
            //console.log(thistable.list_of_years);
            if(thistable.list_of_years.length === 0){
                thistable.whole_years.sort(function (a,b) {
                    return a - b;
                });
                thistable.bmap.update(thistable.whole_years);
                thistable.barChart.update(thistable.whole_years, choosedata);

                //console.log(thistable.whole_years);
            }else{
                thistable.list_of_years.sort(function (a,b) {
                    return a - b;
                });
                thistable.bmap.update(thistable.list_of_years);
                thistable.barChart.update(thistable.list_of_years, choosedata);
                //console.log("list");
            }
        });
        if(thistable.list_of_years.length === 0){
            thistable.whole_years.sort(function (a,b) {
                return a - b;
            });
            thistable.bmap.update(thistable.whole_years);
            thistable.barChart.update(thistable.whole_years, choosedata);
            //console.log("whole");
            //console.log(thistable.whole_years);
        }else{
            thistable.list_of_years.sort(function (a,b) {
                return a - b;
            });
            thistable.bmap.update(thistable.list_of_years);
            thistable.barChart.update(thistable.list_of_years, choosedata);
            console.log("list");
        }


    }

}
