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

### Optional CSS styling shadowDOM with ``::part``

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

### Optional *attributes*

```html
<olympic-medal-ranking 
    flag="EU" 
    total="all" 
    filter="AUT,BEL,BUL,CRO,CYP,CZE,DEN,EST,FIN,FRA,GER,GRE,HUN,IRL,ITA,LAT,LTU,LUX,MLT,NED,POL,POR,ROU,SVK,SLO,ESP,SWE">
  European Union Medal Ranking
</olympic-medal-ranking>

<style>
  olympic-medal-ranking[flag="EU"] {
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