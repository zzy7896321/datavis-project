class LineChart{

    constructor(barChart, bmap, banks){

        this.barChart = barChart;
        this.bmap = bmap;
        this.banks = banks;

        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divlineChart = d3.select("#line-chart");
        this.svgBounds = divlineChart.node().getBoundingClientRect();
        this.svgwidth = 1100 - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divlineChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }
    
    update(choosedata){
        this.bmap.update(this.banks);
        this.barChart.update(this.banks);
        let thistable = this;

        let bdate = "Effective Date";
        //console.log(thistable.banks[bdate]);
        for(let i = 0; i < thistable.banks.length; i++){
            let parsedate = this.banks[i][bdate].split("/");
            thistable.banks[i].efyear = parsedate[2];
        }

        //sort by year
        thistable.banks.sort(function (a,b) {
            return a.efyear - b.efyear;
        });
        console.log(choosedata);
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
                    console.log(thistable.banks[i][choosedata]);
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
                        console.log(typeof j);
                        console.log(thistable.banks[i][choosedata]);
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
            aggrebanks[i].nextamount = aggrebanks[i+1].amount;
        }
        aggrebanks[aggrebanks.length-1].nextamount = null;
        console.log(aggrebanks);

        //scale
        this.xScale = d3.scaleLinear()
            .domain([(+d3.min(aggrebanks,d=>d.efyear)) - 1,(+d3.max(aggrebanks,d=>d.efyear)) + 1])
            .range([40,thistable.svgwidth - 40]);
        //if()
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(aggrebanks, d => d.amount)])
            .range([thistable.svgHeight - this.margin.bottom, this.margin.top]).nice();
        //console.log(thistable.banks.length);

        //clear
        //thistable.svg.select("#lines").html();
        //thistable.svg.select("#circles").html();

        // Create the axes
        let xAxis = d3.axisTop();
        xAxis.scale(thistable.xScale);
        this.svg.append("g").attr("id","xAxis");
        this.svg.append("g").attr("id","yAxis");
        d3.select("#xAxis")
            .attr("transform", "translate(0," + (+thistable.svgHeight-this.margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0,20)");
        let yAxis = d3.axisLeft();
        yAxis.scale(thistable.yScale);
        d3.select("#yAxis")
            .attr("transform", "translate(40, 0)")
            .call(yAxis)
            .selectAll("text");
            //.attr("transform", "scale(1, -1) rotate(180)");

        //create lines
        this.svg.append("g").attr("id","lines");
        d3.select("#lines").html("").selectAll("line").data(aggrebanks)
            .enter()
            .filter(d => d.nextamount !== null)
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
                return thistable.yScale(d.nextamount);
            })
            .classed("lineChart",true);
        this.svg.append("g").attr("id","circles");
        d3.select("#circles").html("").selectAll("circle").data(aggrebanks)
            .enter()
            .filter(d=> d.nextamount !== null)
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
    }

}
