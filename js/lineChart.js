class LineChart{

    constructor(barChart, bmap, banks){

        this.barChart = barChart;
        this.bmap = bmap;
        this.banks = banks;

        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divlineChart = d3.select("#line-chart");
        this.svgBounds = divlineChart.node().getBoundingClientRect();
        this.svgwidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divlineChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }
    
    update(){
        this.bmap.update(this.banks); 
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

        console.log(thistable.banks);

        //aggregation
        let aggrebanks = [];
        let k = 0;
        let j = 0;
        for(let i = 0; i < thistable.banks.length; i++){
            if(i === thistable.banks.length -1){
                aggrebanks.push({});
                aggrebanks[k].efyear = +thistable.banks[i].efyear;
                aggrebanks[k].amount = j+1;
                k++;
                j = 0;
            }else{
                if(thistable.banks[i].efyear === thistable.banks[i+1].efyear){
                    j++;
                }else{
                    aggrebanks.push({});
                    aggrebanks[k].efyear = +thistable.banks[i].efyear;
                    aggrebanks[k].amount = j+1;
                    k++;
                    while(+thistable.banks[i+1].efyear !== aggrebanks[k-1].efyear +1){
                        console.log([+thistable.banks[i+1].efyear, aggrebanks[k-1].efyear + 1]);
                        aggrebanks.push({});
                        aggrebanks[k].efyear = aggrebanks[k-1].efyear + 1;
                        aggrebanks[k].amount = 0;
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
            .domain([(+d3.min(aggrebanks,d=>d.efyear)-1),(+d3.max(aggrebanks,d=>d.efyear)+1)])
            .range([0,thistable.svgwidth]);
        this.yScale = d3.scaleLinear()
            .domain([0,thistable.banks.length])
            .range([0,thistable.svgHeight]);
        //console.log(thistable.banks.length);

        // Create the axes
        let xAxis = d3.axisTop();
        xAxis.scale(thistable.xScale);
        this.svg.append("g").attr("id","xAxis");
        this.svg.append("g").attr("id","yAxis");
        d3.select("#xAxis")
            .attr("transform", "translate(40," + (+thistable.svgHeight-20) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0,20)");
        let yAxis = d3.axisLeft();
        yAxis.scale(thistable.yScale);
        d3.select("#yAxis")
            .attr("transform", "translate(40,-20)")
            .call(yAxis)
            .selectAll("text")
            .attr("transform", "scale(1, -1) rotate(180)");

        //create lines
        let line = this.svg.append("g").attr("id","lines");
        line.selectAll("line").data(aggrebanks).enter().append("line")
            .attr("x1",function (d) {
                return thistable.xScale(d.efyear);
            })
            .attr("y1",function (d) {
                if(d.nextamount !== null){
                    return thistable.yScale(d.amount);
                }
            })
            .attr("x2",function (d) {
                return thistable.xScale(+d.efyear + 1);
            })
            .attr("y2",function (d) {
                if(d.nextamount !== null){
                    return thistable.yScale(d.nextamount);
                }
            })
            .classed("lineChart",true);
    }

}
