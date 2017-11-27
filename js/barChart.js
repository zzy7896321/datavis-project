class BarChart{

    constructor(){

        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divbarChart = d3.select("#bar-chart");
        this.svgBounds = divbarChart.node().getBoundingClientRect();
        this.svgwidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divbarChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }

    update(list_of_years){

        console.log(list_of_years);

    }



}