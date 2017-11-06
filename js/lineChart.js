class lineChart{

    constructor(){
        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divlineChart = d3.select("#line-chart");
        this.svgBounds = divlineChart.node().getBoundingClientRect();
        this.svgwidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divlineChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }



}