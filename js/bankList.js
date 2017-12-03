class BankList {
    constructor(map) {
        let thislist = this;
        this.map = map;

        this.list = d3.select("#bank-list");
        this.bank_details = d3.select("#bank-details");
        this.bank_list_expand = d3.select("#bank-list-expand");
        
        this.current_expanded = 0;
        this.total = 0;
        this.bank_list_expand.on("click", function() {
            if (thislist.current_expanded == 0) {
                thislist.show_all();
            } else {
                thislist.hide_all();
            }
        });
    }

    clear() {
        this.list.html("");
        this.bank_details.html(
            "<h4>Click on the bank name to show details.</h4>");
    }

    update(banks) {
        let thislist = this;
        this.clear();
        
        let banks_by_state = d3.nest().key(d => d.ST).entries(banks).sort(
            (d1, d2) => (d1.key < d2.key) ? -1 : ((d1.key == d2.key) ? 0 : 1));
        for (let d of banks_by_state) {
            d.values.sort((d1, d2) => (d1.City < d2.City) ? -1 : ((d1.City == d2.City) ? 0 : 1));
            d.shown = false;
        }

        this.list.selectAll("li").data(banks_by_state).enter()
            .append("li")
            .attr("id", function (d) {
                return d.key + "-menu";
            })
            .classed("bank-list-text", true)
            .classed("state-menu", true)
            .append("span")
            .text(d => d.values[0].ST + " (" + d.values.length + ")")
            .on("click", function () {
                thislist.show_or_hide(d3.select(this).datum().key);
            });
        
        this.total = banks_by_state.length;
        if (banks.length <= 10 || banks_by_state.length == 1) {
            this.show_all();
        } else {
            this.hide_all();
        }
    }

    show_or_hide(state) {
        let thislist = this;
        let menu = d3.select("#" + state + "-menu");
        let d = menu.datum();
        if (!d.shown) {
            menu
            .append("ul")
            .attr("id", state + "-bank-list")
            .selectAll("li")
            .data(d => d.values)
            .enter()
            .append("li")
            .text(bank => bank["Institution Name"])
            .classed("bank-list-text", true)
            .on("click", function () {
                let bank_li = d3.select(this);
                let bank = bank_li.datum();
                thislist.bank_details.html(`
                <h4>${bank["Institution Name"]}</h4>
                <span>Location: ${bank["Location"]}</span><br>
                <span>Effective Date: ${bank["Effective Date"]}</span><br>
                <span>Total Assets: ${bank["Total Assets"]}</span><br>
                <span>Total Deposites: ${bank["Total Deposits"]}</span><br>
                <span>Estimated Loss: ${bank["Estimated Loss"]}</span><br>
                <span>Acquirer: ${bank["Acquiring Institution"]}</span>
                `);
                
                thislist.map.markDetailedBank(bank);
            });
            d.shown = true;
            thislist.set_current_expanded(thislist.current_expanded + 1);
        } else {
            menu.select("#" + state + "-bank-list").remove();
            d.shown = false;
            thislist.set_current_expanded(thislist.current_expanded - 1);
        }
    }

    set_current_expanded(new_cnt) {
        this.current_expanded = new_cnt;
        if (this.current_expanded < this.total) {
            this.bank_list_expand.text("Expand All")
        } else {
            this.bank_list_expand.text("Collapse All")
        }
    }

    show_all() {
        let thislist = this;
        this.list.selectAll(".state-menu")
            .filter(d => !d.shown)
            .each(d => thislist.show_or_hide(d.key));
        this.bank_list_expand.text("Collapse All")
        this.set_current_expanded(this.total);
    }

    hide_all() {
        let thislist = this;
        this.list.selectAll(".state-menu")
            .filter(d => d.shown)
            .each(d => thislist.show_or_hide(d.key));
        this.set_current_expanded(0);
    }
}
