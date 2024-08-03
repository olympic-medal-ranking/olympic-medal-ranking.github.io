!(function () {
    // safely load Flag WebComponents
    if (!customElements.get("flag-olympic"))
        document.head.append(Object.assign(document.createElement("script"), {
            src: "//flagmeister.github.io/elements.flagmeister.min.js",
            //async: true,
            //onload: () => console.log(`Loaded ${src}`)
        }))
})();
customElements.whenDefined("flag-olympic").then(() => {

    // ================================================================ generic DOM creation helper functions
    const createElement = (tag, props = {}, children = []) => {
        let el = Object.assign(document.createElement(tag), props);
        el.append(...children);
        return el;
    }
    const createElementTD = (className, part, innerHTML, props = {}) => createElement("td", { className, part, innerHTML, ...props })

    // ================================================================ define <olympic-medal-ranking>
    customElements.define("olympic-medal-ranking", class extends HTMLElement {
        static get observedAttributes() {
            return ["sort", "filter", "total"] // attribues force re-creation of <table>
        }
        attributeChangedCallback(name, oldValue, newValue) {
            //console.log("attr", name, oldValue, newValue, this.isConnected);
            // all default attributes trigger this callback, we only want to execute connectedCallback later
            this.isConnected && this.connectedCallback();
        }
        constructor() {
            super()
                .attachShadow({ // create shadowDOM so global CSS can't mess with this CSS (and this CSS doesn't "bleed out")
                    mode: "open" // all JS programmers can access shadowDOM with .shadowRoot
                }).append(
                    // ---------------------------------------------------- create CSS inside shadowDOM
                    createElement("style", {
                        innerHTML:
                            "table{border-collapse:collapse;font:100% Arial;border:1px solid grey}" + // style <table>
                            "td{padding:3px;text-align:left;border-bottom:1px solid lightgrey}" + // style <td> cells
                            ".header,.rank,.flag,.medals{text-align:center;width:10%}" + // style cells with text
                            ".countryname{cursor:pointer}" +
                            ".medals{cursor:n-resize}" +
                            ".gold{background:gold}.silver{background:silver}.bronze{background:peru}" + // color medals
                            ".flag img{aspect-ration:4/3;display:inline-block;max-width:100%;border:1px solid grey;vertical-align:top}" // style flag IMG
                    }),
                    // ---------------------------------------------------- <table>
                    this.table = createElement("table", { part: "table" })
                ); // append shadow
        }// constructor

        async connectedCallback() {
            setTimeout(() => this.connectedCallback(), 3e5);
            // ================================================================ application data
            const LANG = this.getAttribute("lang") || "ENG";
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // API will probably be different for future Olympics
            const API = `//olympics.com/OG2024/data/CIS_MedalNOCs~lang=${LANG}~comp=OG2024.json`;

            //const LANGS = "ENG,FRA,GER,SPA,ITA,CHI"; // optional UI languages
            const FLAGS = "AFG:af,ALB:al,ALG:dz,AND:ad,ANG:ao,ANT:ag,ARG:ar,ARM:am,ARU:aw,ASA:as,AUS:au,AUT:at,AZE:az,BAH:bs,BRN:bh,BAN:bd,BAR:bb,BLR:by,BEL:be,BEN:bj,BER:bm,BHU:bt,BOL:bo,BIH:ba,BOT:bw,BRA:br,IVB:vg,BRU:bn,BUL:bg,BUR:bf,BDI:bi,CPV:cv,CAM:kh,CMR:cm,CAN:ca,CAY:ky,CAF:cf,CHA:td,CHI:cl,CHN:cn,COL:co,COM:km,COD:cd,COK:ck,CRC:cr,CIV:ci,CRO:hr,CUB:cu,CYP:cy,CZE:cz,DEN:dk,DJI:dj,DMA:dm,DOM:do,ECU:ec,EGY:eg,ESA:sv,GEQ:gq,ERI:er,EST:ee,ETH:et,FIJ:fj,FIN:fi,FRA:fr,GAB:ga,GAM:gm,GEO:ge,GER:de,GHA:gh,GRE:gr,GRN:gd,GUM:gu,GUA:gt,GUI:gn,GBS:gw,GUY:gy,HAI:ht,HON:hn,HKG:hk,HUN:hu,ISL:is,IND:in,INA:id,IRI:ir,IRQ:iq,IRL:ie,ISR:il,ITA:it,JAM:jm,JPN:jp,JOR:jo,KAZ:kz,KEN:ke,PRK:kp,KOR:kr,KOS:xk,KUW:kw,KGZ:kg,LAO:la,LAT:lv,LBN:lb,LES:ls,LBR:lr,LBA:ly,LIE:li,LTU:lt,LUX:lu,MAD:mg,MAW:mw,MAS:my,MDV:mv,MLI:ml,MLT:mt,MTN:mr,MRI:mu,MEX:mx,MDA:md,MGL:mn,MNG:mn,MNE:me,MAR:ma,MOZ:mz,MYA:mm,NAM:na,NRU:nr,NEP:np,NED:nl,NZL:nz,NCA:ni,NIG:ng,NOR:no,OMA:om,PAK:pk,PLW:pw,PLE:ps,PAN:pa,PNG:pg,PAR:py,PER:pe,PHI:ph,POL:pl,POR:pt,PUR:pr,QAT:qa,ROU:ro,RUS:ru,RWA:rw,SKN:kn,LCA:lc,VIN:vc,SAM:ws,SMR:sm,STP:st,KSA:sa,SEN:sn,SRB:rs,SEY:sc,SLE:sl,SGP:sg,SVK:sk,SLO:si,SOL:sb,SOM:so,RSA:za,ESP:es,SRI:lk,SUD:sd,SUR:sr,SWZ:sz,SWE:se,SUI:ch,SYR:sy,TPE:tw,TJK:tj,TAN:tz,THA:th,TLS:tl,TOG:tg,TGA:to,TRI:tt,TUN:tn,TUR:tr,TKM:tm,UGA:ug,UKR:ua,UAE:ae,GBR:gb,USA:us,URU:uy,UZB:uz,VAN:vu,VEN:ve,VIE:vn,ISV:vi,YEM:ye,ZAM:zm,ZIM:zw"
                .split(",").map(c => c.split(":")).reduce((obj, [a3, a2]) => (obj[a3] = a2, obj), {});
            const DETAILEDFLAGS = "ec,kz,mx,mn,md,eg,fj,do"; // Flagmeister flags that need more detail!

            // sortBy functions
            const sortby = {
                gold: arr => arr.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total),
                silver: arr => arr.sort((a, b) => b.silver - a.silver || b.gold - a.gold || b.bronze - a.bronze || b.total - a.total),
                bronze: arr => arr.sort((a, b) => b.bronze - a.bronze || b.gold - a.gold || b.silver - a.silver || b.total - a.total),
                total: arr => arr.sort((a, b) => b.total - a.total || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze),
                // countryname already links to Olympic Site by name
                //countryname: arr => arr.sort((a, b) => a.organisation.description.localeCompare(b.organisation.description))
            }
            // ================================================================ configuration attributes
            let sort = this.getAttribute("sort") || "gold";
            let headerflag = this.getAttribute("flag") || "olympic"; // header shows Olympic flag by default
            let games = this.getAttribute("games") || "Paris 2024"; // ready for games="LA 2028" attribute
            let filter = this.getAttribute("filter"); // filter by IOC countrycode 
            let total = this.getAttribute("total") || 10;
            if (filter == "all") filter = "";
            if (filter == "EU") {
                filter = "AUT,BEL,BUL,CRO,CYP,CZE,DEN,EST,FIN,FRA,GER,GRE,HUN,IRL,ITA,LAT,LTU,LUX,MLT,NED,POL,POR,ROU,SVK,SLO,ESP,SWE";
                total = "all"
            }
            if (total == "all") total = 999;

            // ================================================================ call API
            const records = (await (await fetch(API)).json()).medalNOC;
            /**
             * {
                    "gender": "M",
                    "sport": "BMF",
                    "gold": 1,
                    "silver": 0,
                    "bronze": 0,
                    "total": 1,
                    "rank": 1,
                    "rankEqual": "N",
                    "sortRank": 1,
                    "rankTotal": 1,
                    "rankTotalEqual": "Y",
                    "sortRankTotal": 1,
                    "org": "ARG",
                    "organisation": {
                        "code": "ARG",
                        "description": "Argentina",
                        "longDescription": "Argentina",
                        "protocolOrder": 10,
                        "descriptionOrder": 80,
                        "longDescriptionOrder": 80
                    }
                }
             */
            //console.log(records[0]); // debug first record
            // every won medal is a record with person and sport info
            // We want only the TOTal GLObal records, sorted by medal count ranking
            const ranking = (sortby[sort] || (console.warn("invalid sort", sort), sortby.gold))(
                records.filter(row => row.gender === "TOT" && row.sport === "GLO")
            ).map(record => ({ // return only the data we need
                country: {
                    code: record.org,
                    name: record.organisation.description,
                    sort: record.organisation.descriptionOrder,
                    flag: FLAGS[record.org] || console.error("Missing flag", record)
                },
                ranking: {
                    rank: record.rank,
                    equal: record.rankEqual, // "N" or "Y" same ranking as other countries
                    total: record.rankTotal,
                    totalequal: record.rankTotalEqual // "N" or "Y" same total medals as other countries
                },
                medals: {
                    gold: record.gold,
                    silver: record.silver,
                    bronze: record.bronze,
                    total: record.total
                },
            }))
            //.map((x, idx) => (console.log(idx, x), x));
            console.log(`%c ${ranking.length} countries won medals `, "background:gold");
            // ================================================================ create <table>
            this.table.replaceChildren(
                createElement("thead", { part: "thead" },
                    [
                        createElement("tr", {
                // colspan can not be set as PROPERTY on TD Element, innerHTML is shortest then
                            innerHTML: `<td colspan=3><flag-${headerflag}></flag-${headerflag}></td>` +
                                `<td colspan=5 class=header part=header><slot>${games}</slot></td>`
                        }),
                    ]),
                createElement("tbody", { part: "tbody" },
                    [
                // ---------------------------------------------------- loop all JSON results
                        // ---------------------------------------------------- add <tr> for each country
                        ...ranking.slice(0, total).map((country, idx) => {
                            const { code, name, flag } = country.country;
                            if (filter && !filter.includes(code)) return ""; // only list countries user wants to see
                            else return createElement("tr", {
                                // id: code,
                                // title: name,
                                onclick: _ => document.location = "//olympics.com/en/paris-2024/medals/" + name.toLowerCase()
                            }, [
                                // tr.append: 8 column/TD elements
                                // createElementTD ( class , part , innerHTML , properties )
                                createElementTD("rank", "rank", sort == "total" ? country.ranking.total : country.ranking.rank),
                                createElementTD("flag", "flag",
                                    `<flag-${flag} ` +
                                    ((this.hasAttribute("detailflags") && DETAILEDFLAGS.includes(flag))
                                        ? "detail=1" // force loading correct SVG flag
                                        : "" // incorrect flags load detail SVG when over 9 pixels
                                    ) +
                                    `></flag-${flag}>`
                                ),
                                createElementTD("countrycode", "countrycode", code),
                                createElementTD("countryname", "countryname", name),
                                // create 4 medal TD columns
                                ...["gold", "silver", "bronze", "total"]
                                    .map(s => createElementTD("medals " + s, "medal medal" + s, country.medals[s],
                                        { // <td> properties and methods
                                            onclick: e => {
                                                e.stopPropagation();
                                                this.sort(s);
                                            }
                                        }))
                            ])// createElement <tr>
                        }) // .map all countries
                    ])) // replaceChildren tbody
        } // connectedCallback

        // ==================================================================== Web Component Methods
        sort(name) {
            this.setAttribute("sort", name);
        }
        // ==================================================================== end of <olympic-medal-ranking>
    }); // define <olympic-medal-ranking>
}); // whenDefined("flag-olympic")
