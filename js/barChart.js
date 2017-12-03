class BarChart{

    constructor(){

        this.margin = {top: 10, right: 50, bottom: 130, left: 70};
        let divbarChart = d3.select("#bar-chart");
        let svgBounds = divbarChart.node().getBoundingClientRect();
        this.svgWidth = svgBounds.width;
        this.svgHeight = 345;
        this.barWidth = 20;
        this.barPadding = 5;
        this.barSlotWidth = this.barWidth + 2 * this.barPadding;

        this.svg = divbarChart.append("svg")
            .attr("width",this.svgWidth)
            .attr("height",this.svgHeight);
    }

    update(banks, choosedata){

        //help understand
        //console.log(this.banks);
        //console.log(choosedata);

        //init
        let thistable = this;
        
        this.banks = banks;
        //operate data

        let acbanks = [];
        let i;
        let j=1;
        let acname = "Acquiring Institution";
        for(i = 0; i< thistable.banks.length; i++){
            acbanks.push({});
            acbanks[0].acbank_name = thistable.banks[i][acname];
            if(choosedata === 'bank_amounts'){
                acbanks[0].amount = 1;
            }else {
                acbanks[0][choosedata] = +thistable.banks[i][choosedata];
            }
            break;
        }
        for(let k = i+1; k < thistable.banks.length; k++){
            let check = acbanks.some(function (t) { return t.acbank_name === thistable.banks[k][acname]; });
            //console.log(check);
            if(check){
                let index = acbanks.findIndex(d => d.acbank_name === thistable.banks[k][acname]);
                if(choosedata === 'bank_amounts'){
                    acbanks[index].amount ++;
                }else{
                    acbanks[index][choosedata] = acbanks[index][choosedata] + +thistable.banks[k][choosedata];
                }

            }else {
                acbanks.push({});
                acbanks[j].acbank_name = thistable.banks[k][acname];
                if(choosedata === 'bank_amounts'){
                    acbanks[j].amount = 1;
                }else {
                    acbanks[j][choosedata] = +thistable.banks[k][choosedata];
                }
                j++
            }
        }
        acbanks.sort(function (a,b) {
            if(choosedata === 'bank_amounts'){
                return b.amount - a.amount;
            }else{
                return b[choosedata] - a[choosedata];
            }

        });
        //console.log(acbanks);
        let dataset = [];
        let len = 0;
        if(acbanks.length >= 10){
            len = 10;
        }else {
            len = acbanks.length;
        }
        for(let k = 0; k < len; k++){
            dataset.push({});
            dataset[k].acbank_name = acbanks[k].acbank_name;
            if(choosedata === 'bank_amounts'){
                dataset[k].amount = acbanks[k].amount;
            }else {
                dataset[k][choosedata] = acbanks[k][choosedata];
            }
        }
        //console.log(dataset);
        let banknames = dataset.map(d => d.acbank_name);
        banknames.splice(0, 0, "");
        let xPosition = [thistable.margin.left];
        for (let i = 0; i < dataset.length; ++i) {
            xPosition.push(thistable.margin.left + 
                + this.barSlotWidth * (i + 0.5));
        }
        for (let i = dataset.length; i <= 10; ++i) {
            banknames.push("");    
            xPosition.push(thistable.margin.left +
                    this.barSlotWidth * (i + 0.5));
        }

        //scale

        this.xScale = d3.scaleOrdinal()
            .domain(banknames)
            .range(xPosition);
        if(choosedata === 'bank_amounts'){
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d.amount)])
                .range([0, 
                        thistable.svgHeight - thistable.margin.bottom - thistable.margin.top
                ]).nice();
        }else {
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d[choosedata])])
                .range([0,
                        thistable.svgHeight - thistable.margin.bottom - thistable.margin.top
                ]).nice();
        }

        //create the axes
        this.svg.html("");
        let xAxis = d3.axisTop();
        xAxis.scale(thistable.xScale);
        this.svg.append("g").attr("id","barxAxis");
        this.svg.append("g").attr("id","baryAxis");
        d3.select("#barxAxis")
            .attr("transform", "translate(0," + (+thistable.svgHeight-this.margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .classed("bar-chart-text", true)
            .attr("transform", "translate(0, 20) rotate(25)");

        let yAxis = d3.axisLeft();
        yAxis.scale(thistable.yScale);
        let yScaleTicks = thistable.yScale.ticks();
        if (yScaleTicks.length >= 2 && yScaleTicks[0] == 0) {
            if (yScaleTicks[1] < 1000) {
                yAxis.tickFormat(d3.format("d"));
            } else if (yScaleTicks[1] < 1000000) {
                yAxis.tickFormat(d3.formatPrefix(".0", 1e3));
            } else {
                yAxis.tickFormat(d3.formatPrefix(".0", 1e6));
            }
        }

        d3.select("#baryAxis")
            .attr("transform", "translate("
                    + thistable.margin.left + ", "
                    + (thistable.svgHeight - thistable.margin.bottom + 1) // a mysterious 1
                    + "), scale(1, -1)")
            .call(yAxis)
            .selectAll("text")
            .attr("transform", "scale(1, -1)")
            .classed("axis-ticks", true);

        //create bars
        this.svg.append("g").attr("id","bars").attr("transform","translate(0," + thistable.svgHeight +") scale(1,-1)");
        d3.select("#bars").html("").selectAll("rect").data(dataset)
            .enter()
            .append("rect")
            .attr("x",function (d) {
                return thistable.xScale(d.acbank_name);
            })
            .attr("y",this.margin.bottom)
            .attr("height",function (d) {
                if(choosedata === 'bank_amounts'){
                    return thistable.yScale(d.amount);
                }else {
                    return thistable.yScale(d[choosedata]);
                }
            })
            .attr("width",20);

    }

}
