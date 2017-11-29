class BarChart{

    constructor(banks){

        this.banks = banks;

        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divbarChart = d3.select("#bar-chart");
        this.svgBounds = divbarChart.node().getBoundingClientRect();
        this.svgwidth = 1100 - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divbarChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }

    update(list_of_years, choosedata){

        //help understand
        console.log(this.banks);
        //console.log(choosedata);
        //console.log(list_of_years);

        //init
        let thistable = this;

        //operate data

        let acbanks = [];
        let i;
        let j=1;
        let acname = "Acquiring Institution";
        for(i = 0; i< thistable.banks.length; i++){
            if(list_of_years.includes(thistable.banks[i].efyear)){
                acbanks.push({});
                acbanks[0].acbank_name = thistable.banks[i][acname];
                if(choosedata === 'bank_amounts'){
                    acbanks[0].amount = 1;
                }else {
                    acbanks[0][choosedata] = +thistable.banks[i][choosedata];
                }
                break;
            }
        }
        for(let k = i+1; k < thistable.banks.length; k++){
            if(list_of_years.includes(thistable.banks[k].efyear)){
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
        }
        acbanks.sort(function (a,b) {
            if(choosedata === 'bank_amounts'){
                return b.amount - a.amount;
            }else{
                return b[choosedata] - a[choosedata];
            }

        });
        console.log(acbanks);
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
        console.log(dataset);

        //scale

        this.xScale = d3.scaleLinear()
            .domain([0.5, 10.5])
            .range([70,thistable.svgwidth - 70]);
        if(choosedata === 'bank_amounts'){
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d.amount)])
                .range([this.margin.top,thistable.svgHeight - this.margin.bottom]).nice();
        }else {
            thistable.yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d[choosedata])])
                .range([this.margin.top, thistable.svgHeight - this.margin.bottom]).nice();
        }

        //create the axes

        let xAxis = d3.axisTop();
        xAxis.scale(thistable.xScale);
        this.svg.append("g").attr("id","barxAxis");
        this.svg.append("g").attr("id","baryAxis");
        d3.select("#barxAxis")
            .attr("transform", "translate(0," + (+thistable.svgHeight-this.margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0,20)");
        let yAxis = d3.axisLeft();
        yAxis.scale(thistable.yScale);
        d3.select("#baryAxis")
            .attr("transform", "translate(70, 190) scale(1,-1)")
            .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate(0,0) scale(1,-1)")
            ;

        //create bars
        this.svg.append("g").attr("id","bars").attr("transform","translate(0," + thistable.svgHeight +") scale(1,-1)");
        d3.select("#bars").html("").selectAll("rect").data(dataset)
            .enter()
            .append("rect")
            .attr("x",function (d,i) {
                return thistable.xScale(i)+80;
            })
            .attr("y",30)
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