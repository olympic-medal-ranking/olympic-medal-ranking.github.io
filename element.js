!(function () {
    if (!customElements.get("flag-olympic")) {
        let src = "https://flagmeister.github.io/elements.flagmeister.min.js";
        document.head.append(Object.assign(document.createElement("script"), {
            src,
            //async: true,
            //onload: () => console.log(`Loaded ${src}`)
        }));
    }
})();
customElements.whenDefined("flag-olympic").then(() => {
    customElements.define("olympic-medal-ranking", class extends HTMLElement {
        async connectedCallback() {
            // ================================================================ configuration attributes
            let headerflag = this.getAttribute("flag") || "olympic"; // header shows Olympic flag by default
            let games = this.getAttribute("games") || "Paris 2024"; // ready for games="LA 2028" attribute
            let API = this.getAttribute("api") || "https://api.olympics.kevle.xyz/medals?iso_codes=true";
            let iocfilter = this.getAttribute("iocfilter"); // filter by IOC countrycode 
            let total = this.getAttribute("total") || 10;
            if (iocfilter == "all") iocfilter = "";
            if (total == "all") total = 999;
            // ================================================================ create HTML
            this
                .attachShadow({ // create shadoDOM so global CSS can't mess with this CSS (and this CSS doesn't "bleed out")
                    mode: "open" // all JS programmers can access shadowDOM with .shadowRoot
                })
                .innerHTML =
                // ---------------------------------------------------- create CSS inside shadowDOM
                "<style>" +
                ":host{--flagmeisterdetail:100}" +
                "table{border-collapse:collapse;font:100% Arial;border:1px solid grey}" + // style <table>
                "td{padding:3px;text-align:left;border-bottom:1px solid lightgrey}" + // style <td> cells
                ".header,.rank,.flag,.medals{text-align:center;width:8%}" + // style cells with text
                ".gold{background:gold}.silver{background:silver}.bronze{background:peru}" + // color medals
                //"[is*='flag']{background:red;display:inline-block;width:100%;max-height:75%}"+
                ".flag img{display:inline-block;max-width:100%;border:1px solid grey;vertical-align:top}" + // style flag IMG
                "</style>" +
                // ---------------------------------------------------- create <table> HTML inside shadowDOM
                "<table part=table><thead part=thead><tr>" +
                `<td colspan=3><flag-${headerflag}></flag-olympic></td>` +
                `<td colspan=5 class=header part=header><slot>${games} Olympic Medal Ranking</slot></td>` +
                "</tr></thead><tbody>" +
                // ---------------------------------------------------- call data API
            (await (await fetch(API, { mode: "no-cors" })).json())
                    // loop all JSON results
                    .results.slice(0, total).map((result, idx) => {
                        // API will probably be different for future Olympics
                        let countrycode = result.country.code;
                        if (iocfilter && !iocfilter.includes(countrycode)) return ""; // only list countries user wants to see
                        // create country row with flag and medals
                        let countryname = result.country.name;
                        let flagiso = result.country.iso_alpha_2;
                        let incorrectflags = "ECU,MEX,KAZ,MGL,MDA,EGY.FIJ"; // flagmeister flags that (may) need detail=10
                        let usedetailflag = (incorrectflags.includes(countrycode)) ? "detail=10" : "";
                        let medalcolumns = s => `<td class="medals ${s}" part="medal medal${s}" >${result.medals[s]}</td>`;

                        return `<tr id=${countrycode} title=${countryname}>` +
                            `<td class=rank part=rank>${idx + 1}</td>` +
                            `<td class=flag><flag-${flagiso} ${usedetailflag}></flag-${flagiso}></td>` +
                            `<td part=countrycode> ${countrycode}</td>` +
                            `<td part=countryname >${countryname}</td>` + ["gold", "silver", "bronze", "total"].map(medalcolumns).join("") +
                            "</tr>"
                    }).join("") +
                `</tbody></table>`;
            // ================================================================ add interactivity
            [...this.shadowRoot.querySelectorAll("[id]")].map(c => {
                c.onclick = () => {
                    console.log(c.id, c.title); //todo: fix countrynames with spaces!
                    document.location = `https://olympics.com/en/paris-2024/medals/${c.title.toLowerCase()}`;
                }
            });
        } // connectedCallback
    }); // define <olympic-medal-ranking>
}); // whenDefined("flag-olympic")