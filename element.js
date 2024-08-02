!(function () {
    // safely load Flag WebComponents
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
            const LANG = this.getAttribute("lang") || "ENG";
            const API = `https://olympics.com/OG2024/data/CIS_MedalNOCs~lang=${LANG}~comp=OG2024.json`;
            const LANGS = "ENG,FRA,GER,SPA,ITA,CHI";
            const FLAGS = "AFG:af,ALB:al,ALG:dz,AND:ad,ANG:ao,ANT:ag,ARG:ar,ARM:am,ARU:aw,ASA:as,AUS:au,AUT:at,AZE:az,BAH:bs,BRN:bh,BAN:bd,BAR:bb,BLR:by,BEL:be,BEN:bj,BER:bm,BHU:bt,BOL:bo,BIH:ba,BOT:bw,BRA:br,IVB:vg,BRU:bn,BUL:bg,BUR:bf,BDI:bi,CPV:cv,CAM:kh,CMR:cm,CAN:ca,CAY:ky,CAF:cf,CHA:td,CHI:cl,CHN:cn,COL:co,COM:km,COD:cd,COK:ck,CRC:cr,CIV:ci,CRO:hr,CUB:cu,CYP:cy,CZE:cz,DEN:dk,DJI:dj,DMA:dm,DOM:do,ECU:ec,EGY:eg,ESA:sv,GEQ:gq,ERI:er,EST:ee,ETH:et,FIJ:fj,FIN:fi,FRA:fr,GAB:ga,GAM:gm,GEO:ge,GER:de,GHA:gh,GRE:gr,GRN:gd,GUM:gu,GUA:gt,GUI:gn,GBS:gw,GUY:gy,HAI:ht,HON:hn,HKG:hk,HUN:hu,ISL:is,IND:in,INA:id,IRI:ir,IRQ:iq,IRL:ie,ISR:il,ITA:it,JAM:jm,JPN:jp,JOR:jo,KAZ:kz,KEN:ke,PRK:kp,KOR:kr,KOS:xk,KUW:kw,KGZ:kg,LAO:la,LAT:lv,LBN:lb,LES:ls,LBR:lr,LBA:ly,LIE:li,LTU:lt,LUX:lu,MAD:mg,MAW:mw,MAS:my,MDV:mv,MLI:ml,MLT:mt,MTN:mr,MRI:mu,MEX:mx,MDA:md,MGL:mn,MNG:mn,MNE:me,MAR:ma,MOZ:mz,MYA:mm,NAM:na,NRU:nr,NEP:np,NED:nl,NZL:nz,NCA:ni,NIG:ng,NOR:no,OMA:om,PAK:pk,PLW:pw,PLE:ps,PAN:pa,PNG:pg,PAR:py,PER:pe,PHI:ph,POL:pl,POR:pt,PUR:pr,QAT:qa,ROU:ro,RUS:ru,RWA:rw,SKN:kn,LCA:lc,VIN:vc,SAM:ws,SMR:sm,STP:st,KSA:sa,SEN:sn,SRB:rs,SEY:sc,SLE:sl,SGP:sg,SVK:sk,SLO:si,SOL:sb,SOM:so,RSA:za,ESP:es,SRI:lk,SUD:sd,SUR:sr,SWZ:sz,SWE:se,SUI:ch,SYR:sy,TPE:tw,TJK:tj,TAN:tz,THA:th,TLS:tl,TOG:tg,TGA:to,TRI:tt,TUN:tn,TUR:tr,TKM:tm,UGA:ug,UKR:ua,UAE:ae,GBR:gb,USA:us,URU:uy,UZB:uz,VAN:vu,VEN:ve,VIE:vn,ISV:vi,YEM:ye,ZAM:zm,ZIM:zw"
                .split(",").map(c => c.split(":")).reduce((obj, [a3, a2]) => (obj[a3] = a2, obj), {});
            const sort = array => array.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze);
            // ================================================================ configuration attributes
            let headerflag = this.getAttribute("flag") || "olympic"; // header shows Olympic flag by default
            let games = this.getAttribute("games") || "Paris 2024"; // ready for games="LA 2028" attribute
            let iocfilter = this.getAttribute("iocfilter"); // filter by IOC countrycode 
            let total = this.getAttribute("total") || 10;
            if (iocfilter == "all") iocfilter = "";
            if (total == "all") total = 999;
            // ================================================================ call API
            const records = (await (await fetch(API)).json()).medalNOC;
            const ranking = sort(records.filter(row => row.gender === "TOT" && row.sport === "GLO"))
                .map(cty => ({
                    country: {
                        code: cty.org,
                        name: cty.organisation.description,
                        flag: FLAGS[cty.org]
                    },
                    rank: cty.rank,
                    rankEqual: cty.rankEqual,
                    rankMedalsTotal: cty.rankTotal,
                    rankMedalsTotalEqual: cty.rankTotalEqual,
                    medals: {
                        gold: cty.gold,
                        silver: cty.silver,
                        bronze: cty.bronze,
                        total: cty.total,
                    },
                }))
            //.map((x, idx) => (console.log(idx, x), x));
            console.log(`%c ${ranking.length} countries won medals `, "background:gold");
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
            // ---------------------------------------------------- loop all JSON results
            ranking.slice(0, total).map((result, idx) => {
                // API will probably be different for future Olympics
                let countrycode = result.country.code;
                if (iocfilter && !iocfilter.includes(countrycode)) return ""; // only list countries user wants to see
                // create country row with flag and medals
                let countryname = result.country.name;
                let flagiso = result.country.flag;
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