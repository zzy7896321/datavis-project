class LineChart{

    constructor(barChart, bmap, banks){

        this.barChart = barChart;
        this.bmap = map;
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

        //scale
        this.xScale = d3.scaleLinear()
            .domain([(d3.min(thistable.banks,d=>d.efyear)-1),(d3.max(thistable.banks,d=>d.efyear)+1)])
            .range([0,thistable.svgwidth]);
        this.yScale = d3.scaleLinear()
            .domain([])
            .range([]);

        //draw lines
        this.svg.selectAll("line").data(thistable.banks).enter().append("line")
            .attr("x1",function (d) {
                return thistable.xScale(d.efyear)
            })
            .attr("y1",0)
            .attr("x2",function (d) {
                return thistable.xScale(d.efyear + 1);
            })
            .attr("y2",50);
         //   .attr("stroke-dasharray",2)
         //   .classed("lineChart",true);
    }



}
