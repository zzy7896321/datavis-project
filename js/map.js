class Map {
    constructor(states) {
        console.log(states);
        let thismap = this;

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
        let state_groups = this.mapLayer.selectAll("g")
            .data(states.features)
            .enter()
            .append("g")
            .attr("id", d => d.properties.state_abbv);

        state_groups.append("path")
            .attr("d", path)
            .classed("map-border", true);
        

        state_groups.filter(d => d.properties.hasOwnProperty("lat2"))
            .append("line")
            .attr("x1", d => 
                thismap.projection([d.properties.lng, d.properties.lat])[0] + (d.properties.state_abbv == "VT" ? 13 : 0))
            .attr("y1", d =>
                thismap.projection([d.properties.lng, d.properties.lat])[1] + (d.properties.state_abbv == "VT" ? 0 : -5))
            .attr("x2", d => 
                thismap.projection([d.properties.lng2, d.properties.lat2])[0])
            .attr("y2", d =>
                thismap.projection([d.properties.lng2, d.properties.lat2])[1])
            .classed("map-line", true);

        state_groups.filter(d => d.properties.state_abbv == "HI")
            .append("line")
            .attr("x1", d => 
                thismap.projection([d.properties.lng, d.properties.lat])[0])
            .attr("y1", d =>
                thismap.projection([d.properties.lng, d.properties.lat])[1])
            .attr("x2", d => 
                thismap.projection([d.properties.lng, d.properties.lat])[0] + 30)
            .attr("y2", d =>
                thismap.projection([d.properties.lng, d.properties.lat])[1] - 5)
            .classed("map-line", true);

        let state_text = state_groups.append("text")
            .attr("x", d => 
                thismap.projection([d.properties.lng, d.properties.lat])[0] + (d.properties.state_abbv == "HI" ? 40: 0))
            .attr("y", d =>
                thismap.projection([d.properties.lng, d.properties.lat])[1])
            .text(d => d.properties.state_abbv)
            .classed("map-text", true);

        state_text.filter(d => d.properties.hasOwnProperty("lat2"))
            .style("text-anchor", "start");

        this.mapLayer.selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("map-border", true);

        this.markerLayer.append("circle")
            .attr("cx", this.projection([-87.629798, 41.878114])[0])
            .attr("cy", this.projection([-87.629798, 41.878114])[1])
            .attr("r", 3)
            .style("fill", "red");
    }

    update(banks) {

    }
}
