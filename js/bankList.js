class BankList {
    constructor(map) {
        this.map = map;

        this.list = d3.select("#bank-list");
        this.bank_details = d3.select("#bank-details");
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
        }
        console.log(banks_by_state);

        this.list.selectAll("li").data(banks_by_state).enter()
            .append("li")
            .text(d => d.values[0].ST + " (" + d.values.length + ")")
            .classed("bank-list-text", true)
            .on("click", function () {

            })
            .append("ul")
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
    }
}
