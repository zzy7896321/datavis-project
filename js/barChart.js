class BarChart{

    constructor(banks){

        this.banks = banks;

        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        let divbarChart = d3.select("#bar-chart");
        this.svgBounds = divbarChart.node().getBoundingClientRect();
        this.svgwidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;

        this.svg = divbarChart.append("svg")
            .attr("width",this.svgwidth)
            .attr("height",this.svgHeight);
    }

    update(list_of_years, choosedata){

        //help understand
        console.log(this.banks);
        //console.log(choosedata);
        //console.log(list_of_years);

        //init
        let thistable = this;

        //operate data

        let acbanks = [];
        let i;
        let j=1;
        let acname = "Acquiring Institution";
        for(i = 0; i< thistable.banks.length; i++){
            if(list_of_years.includes(thistable.banks[i].efyear)){
                acbanks.push({});
                acbanks[0].acbank_name = thistable.banks[i][acname];
                acbanks[0].amount = 1;
                break;
            }
        }
        for(let k = i+1; k < thistable.banks.length; k++){
            if(list_of_years.includes(thistable.banks[k].efyear)){
                let check = acbanks.some(function (t) { return t.acbank_name === thistable.banks[k][acname]; });
                console.log(check);
                if(check){
                    let index = acbanks.findIndex(d => d.acbank_name === thistable.banks[i][acname]);
                    acbanks[index].amount ++;
                }else {
                    acbanks.push({});
                    acbanks[j].acbank_name = thistable.banks[k][acname];
                    acbanks[j].amount = 1;
                    j++
                }
            }
        }
        console.log(acbanks);

        //scale

        //create the axes

        //create bars
        //this.svg.append("g").attr("id","bars");



    }



}