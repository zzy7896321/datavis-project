class Map {
    constructor(states) {
        console.log("map");

        this.width = 700;
        this.height = 400;

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
            .scale([850]);

        let path = d3.geoPath().projection(this.projection);
        this.mapLayer.selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("map-border", true);
    }

    update(banks) {

    }
}
