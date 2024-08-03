# More live examples: https://olympic-medal-ranking.github.io

**Data API by Kevin Le** - see: https://github.com/kevle1/paris-2024-olympic-api

**Web Component by Danny Engelman** - see: [Dev.to blogpost](https://dev.to/dannyengelman/olympic-medal-ranking-web-component-2c1j-temp-slug-4981295)

### &lt;olympic-medal-ranking> Web Component

![alt text](https://res.cloudinary.com/practicaldev/image/fetch/s--tL2azJal--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://i.imgur.com/PurNqpH.png)

### **All** required HTML (yes, all)

```html
<script src="https://olympic-medal-ranking.github.io/element.min.js"></script>

<olympic-medal-ranking></olympic-medal-ranking>
```

### Optional CSS styling shadowDOM with `::part`

```css
    <style>
        /* global CSS styles pre-defined "parts" inside shadowDOM */
        olympic-medal-ranking {
            &::part(table) {
                max-width: 550px;
            }
            &::part(header) {
                font-size: 150%;
                color: goldenrod;
                background: lightgrey;
                text-shadow: 1px 1px 1px black;
            }
            &::part(medal) {
                font-weight: bold;
            }
            &::part(rank),
            &::part(countrycode),
            &::part(medaltotal) {
                font-weight: normal;
                color: grey;
            }
        }
    </style>
```

### Optional _attributes_

| attribute | description | values
| --- | --- | --- |
| total | number of countries to display | value or "all" |  
| flag | replace Olympic logo with flag | [ISO-3166 Alpha-2 flag codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) or [Flagmeister flag codes](https://flagmeister.github.io) |
| sort | sort by column | "gold" (default) or "total" , "silver" , "bronze" |
| filter | filter by IOC country codes | "EU" for All European Union countries |
| lang | IOC language | "ENG" (default) <a href="https://odf.olympictech.org/2024-Paris/codes/HTML/og_cc/Language.htm">IOC language codes</a> |
| games | ready for future Olympic games | "Paris 2024" (default) |

```html
<olympic-medal-ranking flag="EU" filter="EU">European Union Medal Ranking</olympic-medal-ranking>

<style>
  olympic-medal-ranking[filter="EU"] {
    &::part(thead) {
      background: #003399;
    }
    &::part(header) {
      background: inherit;
      color: gold;
      font-weight: bold;
    }
  }
</style>
```

![alt text](https://res.cloudinary.com/practicaldev/image/fetch/s--b2ncys_W--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://i.imgur.com/cFMXnOD.png)

# More live examples: https://olympic-medal-ranking.github.io

<hr>