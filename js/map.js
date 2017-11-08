class Map {
    constructor(states) {
        console.log(states);

        this.width = 1000;
        this.height = 550;

        let div = d3.select("#map");
        this.svg = div.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.mapLayer = this.svg.append("g")
            .attr("id", "mapLayer");

        this.markerLayer = this.svg.append("g")
            .attr("id", "markerLayer");

        this.projection = d3.geoAlbersUsa()
            .translate([this.width / 2, this.height / 2])
            .scale([1150]);

        let path = d3.geoPath().projection(this.projection);
        //this.mapLayer.selectAll("g")
         //   .data(states.features)
          //  .enter()
        this.mapLayer.selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("map-border", true);

        this.markerLayer.append("circle")
            .attr("cx", this.projection([-87.629798, 41.878114])[0])
            .attr("cy", this.projection([-87.629798, 41.878114])[1])
            .attr("r", 2)
            .style("fill", "red");
    }

    update(banks) {

    }
}
