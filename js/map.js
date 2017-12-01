class Map {
    constructor(states, banks) {
        let thismap = this;
        
        this.bankList = new BankList(this);
        
        this.banks = banks;
        this.banks_by_loc = d3.nest()
            .key(d => d.Location)
            .entries(banks);

        console.log(this.banks_by_loc);

        this.min_year = d3.min(banks, d => d.efyear);
        this.max_year = d3.max(banks, d => d.efyear);
        this.year_predicate = new Array(this.max_year - this.min_year + 1);

        //console.log(this.year_banks);

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

        this.brushLayer = this.svg.append("g")
            .attr("id", "brushLayer");

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

        let brush = d3.brush()
            .on("end", function() {
                console.log(d3.event.selection);
                d3.selectAll(".circle-selected")
                    .classed("circle-selected", false);
                if (d3.event.selection != null) {
                    let x1 = d3.event.selection[0][0];
                    let y1 = d3.event.selection[0][1];
                    let x2 = d3.event.selection[1][0];
                    let y2 = d3.event.selection[1][1];

                    thismap.markerLayer.selectAll("circle")
                        .filter(function (d) {
                            let coord = thismap.projection([
                                d.values[0].lng,
                                d.values[0].lat]);
                            return thismap.in_range(
                                coord[0], coord[1],
                                x1, y1, x2, y2);
                        })
                        .classed("circle-selected", true);

                    let selected_banks = banks.filter(
                    function (bank) {
                        if (!thismap.in_years_selected(bank.efyear)) {
                            return false;
                        }
                        let coord = thismap.projection([
                            bank.lng,
                            bank.lat]);
                        return thismap.in_range(
                            coord[0], coord[1],
                            x1, y1, x2, y2);
                    });
                    thismap.bankList.update(selected_banks);
                } else {
                    thismap.bankList.clear();
                }
            });

        this.brushLayer.html("");

        this.brushLayer.classed("brush", true).call(brush);
    }

    in_years_selected(year) {
        return this.year_predicate[year - this.min_year];
    }

    in_range(x, y, x1, y1, x2, y2) {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    update(years) {

        let thismap = this;

        for (let i = 0; i < this.year_predicate; ++i) {
            this.year_predicat[i] = false;
        }
        for (let year of years) {
            this.year_predicate[year - this.min_year] = true;
        }

        let circles = this.markerLayer.selectAll("circle")
            .data(this.banks_by_loc.filter( d => 
                -1 != d.values.findIndex( bank =>
                    thismap.in_years_selected(bank.efyear)
                )
            ));
        circles.exit().remove();
        circles = circles.merge(circles.enter().append("circle"));
        
        circles.attr("cx", function(d) {
            return thismap.projection([d.values[0].lng, d.values[0].lat])[0];
        })
        .attr("cy", function (d) {
            return thismap.projection([d.values[0].lng, d.values[0].lat])[1];
        })
        .classed("circle", true);
    }
}
