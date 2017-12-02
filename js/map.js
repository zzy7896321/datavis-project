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
        for (let i = 0; i < this.year_predicate.length; ++i) {
            this.year_predicate[i] = true;
        }

        let div = d3.select("#map");
        let svgBounds = div.node().getBoundingClientRect();
        this.width = svgBounds.width;
        this.height = 550;

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

        this.opacityScale = d3.scaleLinear()
            .domain([0, d3.max(this.banks_by_loc, d => d.values.length)])
            .range([0.5, 1.0]);

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

        this.markerLayer.selectAll("circle")
            .data(this.banks_by_loc)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return thismap.projection([d.values[0].lng, d.values[0].lat])[0];
            })
            .attr("cy", function (d) {
                return thismap.projection([d.values[0].lng, d.values[0].lat])[1];
            })
            .classed("circle", true)
            .attr("id", function (d) {
                return d.values[0].locationId;
            });

        this.brushSelection = null;

        let brush = d3.brush()
            .on("end", function() {
                d3.selectAll(".circle-selected")
                    .classed("circle-selected", false);
                thismap.brushSelection = d3.event.selection;
                thismap.update();
            });

        this.brushLayer.html("");

        this.brushLayer.classed("brush", true).call(brush);

        this.searchBox = d3.select("#search-box");
        let timeout = null;
        this.searchBox.on("keyup", function () {
            clearTimeout(timeout);

            timeout = setTimeout(function () {
                thismap.update();
            }, 300);
        });

        d3.select("#clear-button").on("click", function () {
            thismap.searchBox.node().value = "";
            thismap.update();
        });
    }

    in_years_selected(year) {
        return this.year_predicate[year - this.min_year];
    }

    in_range(x, y, x1, y1, x2, y2) {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    update(years) {
        let thismap = this;
        
        if (years !== undefined) {
            for (let i = 0; i < this.year_predicate.length; ++i) {
                this.year_predicate[i] = false;
            }
            for (let year of years) {
                this.year_predicate[year - this.min_year] = true;
            }
        }

        let searchText = this.searchBox.node().value;
        
        let brushSelection = this.brushSelection;
        let x1, y1, x2, y2;
        if (brushSelection != null) {
            x1 = this.brushSelection[0][0];
            y1 = this.brushSelection[0][1];
            x2 = this.brushSelection[1][0];
            y2 = this.brushSelection[1][1];
        }
        
        let selected_banks = [];
        this.markDetailedBank();
        this.markerLayer.selectAll("circle")
            .classed("circle-selected", false)
            .style("fill-opacity", 0.15)
            .filter(function (d) {
                let coord = thismap.projection([
                    d.values[0].lng,
                    d.values[0].lat]);
                if (brushSelection != null &&
                    !thismap.in_range(coord[0], coord[1],
                        x1, y1, x2, y2)) {
                    return false;
                }
                
                let result = false;
                for (let bank of d.values) {
                    if (thismap.in_years_selected(bank.efyear)
                        && bank.lowerName.includes(searchText)) {
                        selected_banks.push(bank);
                        result = true;
                    }
                }
                return result;
            })
            .classed("circle-selected", true)
            .style("fill-opacity", d =>
                thismap.opacityScale(d.values.length)
            ).raise();

        this.bankList.update(selected_banks);
    }

    markDetailedBank(bank) {
        let thismap = this;

        d3.selectAll(".circle-detailed")
            .classed("circle-detailed", false)
            .style("fill-opacity", d =>
                thismap.opacityScale(d.values.length)
            );
        if (bank !== undefined) {
            this.markerLayer.select("#" + bank.locationId)
                .classed("circle-detailed", true)
                .style("fill-opacity", 1)
                .raise();
        }
    }
}
