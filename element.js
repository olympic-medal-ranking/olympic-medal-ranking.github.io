// todo detailflags list only once in index.html
!(function () {
    // ================================================================ generic DOM creation helper functions
    const createElement = (tag, props = {}, children = []) => {
        let el = Object.assign(document.createElement(tag), props);
        el.append(...children);
        return el;
    }
    const createElementTD = (className, part, innerHTML, props = {}) => createElement("td", { className, part, innerHTML, ...props })

    // ================================================================ safely load Flagmeister
    if (!customElements.get("flag-olympic"))
        document.head.append(createElement("script", {
            src: "https://flagmeister.github.io/elements.flagmeister.min.js",
            //async: true,
            //onload: () => console.log(`Loaded ${src}`)
        }));

    // ================================================================ wait for Flagmeister to define all flags
    customElements.whenDefined("flag-olympic").then(() => {
        // ================================================================ experiment
        // is there value in a separate component???
        customElements.define("olympic-medal", class extends HTMLElement {
            connectedCallback() {
                this.innerHTML = this.getAttribute("count");
                this.onclick = _ => {
                    this.closest("olympic-medal-ranking").sort(this.getAttribute("type"));
                }
            }
        });
        // ================================================================ define <olympic-medal-ranking> Web Component
        customElements.define("olympic-medal-ranking", class extends HTMLElement {
            static get observedAttributes() {
                return ["sort", "filter", "total"] // attribues force re-creation of <table>
            }
            attributeChangedCallback() {
                //attributeChangedCallback(name, oldValue, newValue) {
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
                                // removed ".rankEqual{opacity:50%}" +
                                ".name{cursor:pointer}" +
                                ".medals{cursor:n-resize}" +
                                ".gold{background:gold}.silver{background:silver}.bronze{background:peru}" + // color medals
                                ".flag img{aspect-ration:4/3;display:inline-block;max-width:100%;border:1px solid grey;vertical-align:top}" // style flag IMG
                        }),
                        // ---------------------------------------------------- <table>
                        this.table = createElement("table", { part: "table" })
                    ); // append shadow
            }// constructor

            async connectedCallback() {

                // debugging only; put only one Web Component on the page
                // if (document.getElementById("FIRSTELEMENT")?.connected) return
                // else this.connected = true;


                setTimeout(() => this.connectedCallback(), 3e5);
                // ================================================================ Olypics.com API data
                // API will probably be different for future Olympics
                //const LANGS = "ENG,FRA,GER,SPA,ITA,CHI"; // IOC API languages
                const API = "https://olympics.com/OG2024/data/CIS_MedalNOCs~lang=" + (this.getAttribute("lang") || "ENG") + "~comp=OG2024.json";
                const OLYMPICSITELINK = name => "https://olympics.com/en/paris-2024/medals/" + name.toLowerCase()

                // ================================================================ sortBy functions
                const sortBy = {
                    gold: arr => arr.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total),
                    silver: arr => arr.sort((a, b) => b.silver - a.silver || b.gold - a.gold || b.bronze - a.bronze || b.total - a.total),
                    bronze: arr => arr.sort((a, b) => b.bronze - a.bronze || b.gold - a.gold || b.silver - a.silver || b.total - a.total),
                    total: arr => arr.sort((a, b) => b.total - a.total || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze),
                }
                // ================================================================ configuration attributes
                let headerflag = this.getAttribute("flag") || "olympic"; // header shows Olympic flag by default
                let games = this.getAttribute("games") || "Paris 2024"; // ready for games="LA 2028" attribute
                let sort = this.getAttribute("sort") || "gold"; // default sort
                let total = this.getAttribute("total") || 10; // nr of records to show
                let score = this.getAttribute("score") || "total"; // nr of records to show

                let filter = this.getAttribute("filter"); // filter by IOC countrycode 
                if (filter == "all")
                    filter = "";
                else
                    if (filter == "EU") {
                        filter = "AUT,BEL,BUL,CRO,CYP,CZE,DEN,EST,FIN,FRA,GER,GRE,HUN,IRL,ITA,LAT,LTU,LUX,MLT,NED,POL,POR,ROU,SVK,SLO,ESP,SWE";
                        total = "all"
                    }
                if (sort == "population") total = this.getAttribute("total") || 999;
                if (total == "all") total = 999; // presuming there are not more than 99 countries winning medals

                // ================================================================ call API
                const records = (await (await fetch(API)).json()).medalNOC;
                // every won medal is a record with person and sport info
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

                // Maybe better object:
                // const countrymedals = records.slice(0, 10).reduce((acc, record) => {
                //     let { org, description } = record;
                //     let country = acc[org] || (acc[org] = { medals: [] }, acc[org]);
                //     if (record.gender + record.sport == "TOTGLO") {
                //         //console.log(org, record, records[org]);
                //         Object.assign(country, {
                //             country: {
                //                 code: record.organisation.code, // 3 letter IOC code
                //                 name: record.organisation.description, // countryname
                //                 sort: record.organisation.descriptionOrder, // sort order  Name
                //                 flag: this.flag(record.organisation.code) // IOC code to ISO flag code
                //             },
                //             ranking: {
                //                 rank: record.rank,
                //                 equal: record.rankEqual == "Y", // "N" or "Y" same ranking as other countries
                //                 total: record.rankTotal,
                //                 totalEqual: record.rankTotalEqual == "Y" // "N" or "Y" same total medals as other countries
                //             },
                //             medalcount: {
                //                 gold: record.gold,
                //                 silver: record.silver,
                //                 bronze: record.bronze,
                //                 total: record.total
                //             },
                //         })
                //     } else {
                //         if (record.gender != "TOT") country.medals.push(record);
                //     }
                //     return acc;
                // }, {}); // reduce all records to a single object
                //console.log(countrymedals);

                // We want only the TOTal GLObal records, sorted by medal count ranking
                const ranking = (sortBy[sort] || sortBy.gold)(
                    records.filter(record => record.gender + record.sport == "TOTGLO")
                )
                    // convert all country records to our own format
                    .map(record => ({
                        country: {
                            code: record.organisation.code, // 3 letter IOC code
                            name: record.organisation.description, // countryname
                            sort: record.organisation.descriptionOrder, // sort order  Name
                            flag: this.flag(record.organisation.code) // IOC code to ISO flag code
                        },
                        ranking: {
                            rank: record.rank,
                            equal: record.rankEqual == "Y", // "N" or "Y" same ranking as other countries
                            total: record.rankTotal,
                            totalEqual: record.rankTotalEqual == "Y" // "N" or "Y" same total medals as other countries
                        },
                        medalcount: {
                            gold: record.gold,
                            silver: record.silver,
                            bronze: record.bronze,
                            total: record.total,
                            score: score == "421"
                                ? (record.gold * 4) + (record.silver * 2) + record.bronze
                                : score == "gold"
                                    ? record.gold
                                    : record.total
                        },
                    }))
                //.map((x, idx) => (console.log(idx, x), x));

                //console.log(`%c ${ranking.length} countries won medals `, "background:gold");

                // ================================================================ create <table>
                this.table.replaceChildren(
                    // ---------------------------------------------------- create <thead>
                    createElement("thead", { part: "thead" },
                        [
                            createElement("tr", {
                                // colspan can not be set as PROPERTY on TD Element, innerHTML is shortest then
                                innerHTML: "<td colspan=3><flag-" + headerflag + "></flag-" + headerflag + "></td>" +
                                    "<td colspan=" + (sort == "population" ? 6 : 5) + " class=header part=header><slot>" + games + "</slot></td>"
                            }),
                        ]),
                    // ---------------------------------------------------- create <tbody>
                    createElement("tbody", { part: "tbody" },
                        [
                            // ---------------------------------------------------- loop all JSON ranking results
                            // ---------------------------------------------------- add <tr> for each country
                            ...ranking
                                .slice(0, total)
                                .map(country => {
                                    const { code, name, flag } = country.country;
                                    const rank = sort == "total" ? country.ranking.total : country.ranking.rank;

                                    if (filter && !filter.includes(code))
                                        return ""; // only list countries user wants to see
                                    else
                                        return createElement("tr", {
                                            part: code,
                                            // still a bug here for countries with spaces in the name, what is the Olympic URL for them?
                                            onclick: _ => document.location = OLYMPICSITELINK(name)
                                        }, [
                                            // tr.append: 8 column/TD elements
                                            // createElementTD ( class , part , innerHTML , [properties] )
                                            createElementTD(
                                            /* class */ "rank",
                                            /* part */ "rank",
                                            /* html */ rank
                                            ),
                                            createElementTD(
                                                "flag",
                                                "flag",
                                                "<flag-" + flag +
                                                ((this.hasAttribute("detailflags")
                                                    &&
                                                    "dm,do,do,ec,eg,fj,gt,kz,md,mn,mx,ug" // Flagmeister flags that need more detail!
                                                        .includes(flag))
                                                    ? " detail=1" // force loading correct SVG flag
                                                    : "" // incorrect flags load detail SVG when over 9 pixels
                                                )
                                                + "></flag-" + flag + ">"
                                            ),
                                            createElementTD("code", "code", code),
                                            createElementTD("name", "name", name),
                                            // create 4 medal TD columns
                                            ...["gold", "silver", "bronze", "total"]
                                                .map(s => createElementTD("medals " + s, "medal medal" + s, country.medalcount[s],
                                                    { // <td> properties and methods
                                                        onclick: e => {
                                                            e.stopPropagation();
                                                            this.sort(s);
                                                        }
                                                    })),
                                            (sort == "population"
                                                ? createElementTD("medals-mpc",
                                                    "medal medal-mpc",
                                                    `<medals-mpc lang=${flag} score="${country.medalcount.score}" >calc&nbsp;${score}...</medals-mpc>`)
                                                : "")
                                        ])// createElement <tr>
                                }) // .map all countries
                            // ---------------------------------------------------- add <tr> for each country
                        ])// createElement <tbody>
                ); // this.table.replaceChildren tbody

            } // connectedCallback

            // ==================================================================== Web Component Methods
            flag(IOC_code) {
                // ================================================================ Olypics.com ICO code to ISO flag code
                // lets be smart here; if the first 2 letters of the IOC code match the ISO flag code, we can use that
                this.flagmap = this.flagmap ||  // cache map Object
                // 1378 Bytes - ALL IOC codes to ISO flag code - Use this to find 2 letters in condensedString variable
                    //"AFG:af,ALB:al,ALG:dz,AND:ad,ANG:ao,ANT:ag,ARG:ar,ARM:am,ARU:aw,ASA:as,AUS:au,AUT:at,AZE:az,BAH:bs,BRN:bh,BAN:bd,BAR:bb,BLR:by,BEL:be,BEN:bj,BER:bm,BHU:bt,BOL:bo,BIH:ba,BOT:bw,BRA:br,IVB:vg,BRU:bn,BUL:bg,BUR:bf,BDI:bi,CPV:cv,CAM:kh,CMR:cm,CAN:ca,CAY:ky,CAF:cf,CHA:td,CHI:cl,CHN:cn,COL:co,COM:km,COD:cd,COK:ck,CRC:cr,CIV:ci,CRO:hr,CUB:cu,CYP:cy,CZE:cz,DEN:dk,DJI:dj,DMA:dm,DOM:do,ECU:ec,EGY:eg,ESA:sv,GEQ:gq,ERI:er,EST:ee,ETH:et,FIJ:fj,FIN:fi,FRA:fr,GAB:ga,GAM:gm,GEO:ge,GER:de,GHA:gh,GRE:gr,GRN:gd,GUM:gu,GUA:gt,GUI:gn,GBS:gw,GUY:gy,HAI:ht,HON:hn,HKG:hk,HUN:hu,ISL:is,IND:in,INA:id,IRI:ir,IRQ:iq,IRL:ie,ISR:il,ITA:it,JAM:jm,JPN:jp,JOR:jo,KAZ:kz,KEN:ke,PRK:kp,KOR:kr,KOS:xk,KUW:kw,KGZ:kg,LAO:la,LAT:lv,LBN:lb,LES:ls,LBR:lr,LBA:ly,LIE:li,LTU:lt,LUX:lu,MAD:mg,MAW:mw,MAS:my,MDV:mv,MLI:ml,MLT:mt,MTN:mr,MRI:mu,MEX:mx,MDA:md,MGL:mn,MNG:mn,MNE:me,MAR:ma,MOZ:mz,MYA:mm,NAM:na,NRU:nr,NEP:np,NED:nl,NZL:nz,NCA:ni,NIG:ng,NOR:no,OMA:om,PAK:pk,PLW:pw,PLE:ps,PAN:pa,PNG:pg,PAR:py,PER:pe,PHI:ph,POL:pl,POR:pt,PUR:pr,QAT:qa,ROU:ro,RUS:ru,RWA:rw,SKN:kn,LCA:lc,VIN:vc,SAM:ws,SMR:sm,STP:st,KSA:sa,SEN:sn,SRB:rs,SEY:sc,SLE:sl,SGP:sg,SVK:sk,SLO:si,SOL:sb,SOM:so,RSA:za,ESP:es,SRI:lk,SUD:sd,SUR:sr,SWZ:sz,SWE:se,SUI:ch,SYR:sy,TPE:tw,TJK:tj,TAN:tz,THA:th,TLS:tl,TOG:tg,TGA:to,TRI:tt,TUN:tn,TUR:tr,TKM:tm,UGA:ug,UKR:ua,UAE:ae,GBR:gb,USA:us,URU:uy,UZB:uz,VAN:vu,VEN:ve,VIE:vn,ISV:vi,YEM:ye,ZAM:zm,ZIM:zw"
                    //  825 Bytes - IOC codes to ISO flag for IOC that are NOT the first 2 letters
                    "ALG:dz,AND:ad,ANG:ao,ANT:ag,ARM:am,ARU:aw,AUT:at,BAH:bs,BRN:bh,BAN:bd,BAR:bb,BLR:by,BEN:bj,BER:bm,BHU:bt,BIH:ba,BOT:bw,IVB:vg,BRU:bn,BUL:bg,BUR:bf,BDI:bi,CPV:cv,CAM:kh,CAY:ky,CAF:cf,CHA:td,CHI:cl,CHN:cn,COM:km,COD:cd,COK:ck,CRO:hr,DEN:dk,ESA:sv,GEQ:gq,EST:ee,FIJ:fj,GAM:gm,GER:de,GRN:gd,GUA:gt,GUI:gn,GBS:gw,GUY:gy,HAI:ht,HON:hn,INA:id,IRQ:iq,IRL:ie,ISR:il,JAM:jm,KAZ:kz,PRK:kp,KOR:kr,KOS:xk,KUW:kw,LAT:lv,LES:ls,LBR:lr,LBA:ly,MAD:mg,MAW:mw,MAS:my,MDV:mv,MLT:mt,MTN:mr,MRI:mu,MEX:mx,MGL:mn,MNE:me,MOZ:mz,MYA:mm,NEP:np,NED:nl,NCA:ni,NIG:ng,PAK:pk,PLW:pw,PLE:ps,PNG:pg,PAR:py,POL:pl,POR:pt,PUR:pr,SKN:kn,VIN:vc,SAM:ws,KSA:sa,SEN:sn,SRB:rs,SEY:sc,SVK:sk,SLO:si,SOL:sb,RSA:za,SRI:lk,SUD:sd,SUR:sr,SWZ:sz,SWE:se,SUI:ch,TPE:tw,TAN:tz,TOG:tg,TGA:to,TRI:tt,TUN:tn,TUR:tr,TKM:tm,UKR:ua,UAE:ae,URU:uy,VAN:vu,VIE:vn,ISV:vi,ZAM:zm,ZIM:zw"
                        .split(",")
                        .map(c => c.split(":"))
                        .reduce((ioc2iso, [a3, a2]) => {
                            ioc2iso[a3] = a2;
                            // list IOC codes where the FIRST 2 LETTERS are NOT the ISO code
                            // if (a3.toLowerCase().substring(0, 2) !== a2) console.warn("IOC ISO mismatch", IOC_code, a2, a3 );
                            return ioc2iso
                        }, {
                            // ioc2iso Object
                        });
                // return mapped code OR first 2 Letters
                return this.flagmap[IOC_code] || IOC_code.toLowerCase().substring(0, 2); // ISO flag code
            }
            // ---------------------------------------------------------------- sort(by value)
            sort(v) {
                this.setAttribute("sort", v);
            }
            // ================================================================ end of <olympic-medal-ranking>
        }) // define <olympic-medal-ranking>
        // ******************************************************************** define <medal-mpc>
        customElements.define("medals-mpc", class extends HTMLElement {
            async connectedCallback() {
                let lang = this.getAttribute("lang") || "fr";
                window.cachedpopulation = window.cachedpopulation || {};
                let population = window.cachedpopulation[lang];
                let country;
                if (population) {
                    console.log("cached", lang, population);
                    this.mpc(population);
                } else {
                    console.log("call api");
                    country = (await (await fetch(`https://restcountries.com/v3.1/alpha/${lang}`)).json())[0];
                    //console.log(country.name.common, country.population);
                    window.cachedpopulation[lang] = country.population;
                    this.mpc(country.population);
                }
            }
            mpc(
                population, // the one and only parameter for this mpc method/function
                // next are variable let declarations, saving "let" statements
                mpc, // medal per captiva
                tbody = this.closest("tbody"),// this.closest("table").tBodies[0],
                tr = this.closest("tr"),
                rowcount = ~~tbody.getAttribute("mpc") + 1,
                attr = "mpc",
            ) {
                // connectedCallback WILL be called again for DOM alterations (done by sort)
                // make sure all our code runs once!
                this.mpc = () => { }
                // use tbody to count how many rows where processed (finished the fetch call)
                tbody.setAttribute(attr, rowcount);
                // calculate medals per capita/million
                mpc = this.getAttribute("score") / population * 1e6;
                this.title = this.getAttribute("score") + " / " + population;
                // store as property on TR for later sorting and show value in TD
                tr[attr] = this.innerText = mpc.toFixed(3);
                // create a sort() method within mpc method so we can reuse scoped variables tbody, attr, this
                this.sort = (asc = this.hasAttribute("desc")) => tbody.replaceChildren(
                    ...[...tbody.rows].sort((tr1, tr2) => (tr1[attr] - tr2[attr]) * (asc ? 1 : -1))
                );
                // when all rows have fetched their data then sort by this column
                if (tbody.rows.length == rowcount) this.sort(0);
            }// .mpc() methdo
        });// define <medal-mpc>

    }) // whenDefined("flag-olympic")
})(); // IIFE
