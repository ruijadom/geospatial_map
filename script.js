// fetch topo.json data
// done a callback function which provides the json data as a topology variable

class D3Map {
  constructor(topology) {
    this.svg = d3
      .select("body")
      .append("svg")
      .attr("id", "map");
    const { height, width } = document
      .getElementById("map")
      .getBoundingClientRect();

    const geojson = topojson.feature(topology, topology.objects["custom.geo"]);
    this.countries = geojson.features;
    this.projection = d3.geoAlbers();
    this.projection.rotate(-75).fitExtent(
      [
        [0, 0],
        [width, height]
      ],
      geojson
    );

    const { min, max } = getGdpPerCapitaRange(geojson.features);
    this.min = min;
    this.max = max;
  }
  drawCountries() {
    const path = d3.geoPath().projection(this.projection);
    const countryGroup = this.svg
      .append("g")
      .selectAll("path")
      .data(this.countries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "white");
    return countryGroup;
  }

  colorCountries(countryGroup) {
    const scale = getScale(this.min, this.max);
    countryGroup.attr("fill", country => {
      return scale(gdpPerCapita(country));
    });
  }

  drawCapitals(capitals) {
    const circleRadius = 5;
    const textSize = 10;
    const capitalGroup = this.svg.append("g");
    capitalGroup
      .selectAll("circle")
      .data(capitals)
      .enter()
      .append("circle")
      .attr("cx", city => this.projection([city.lng, city.lat])[0])
      .attr("cy", city => this.projection([city.lng, city.lat])[1])
      .attr("r", circleRadius + "px")
      .attr("fill", "red");

    capitalGroup
      .selectAll("text")
      .data(capitals)
      .enter()
      .append("text")
      .attr("x", city => this.projection([city.lng, city.lat])[0])
      .attr("y", city => this.projection([city.lng, city.lat])[1])
      .attr("font-size", textSize + "px")
      .attr("transform", `translate(${circleRadius}, ${textSize / 2})`)
      .text(city => city.city);
    return capitalGroup;
  }
}

Promise.all([
  d3.json("assets/data/custom.topo.json"),
  d3.csv("assets/data/capitals.csv")
])
  .then(([topology, capitals]) => {
    const map = new D3Map(topology);
    const countryGroup = map.drawCountries();
    map.colorCountries(countryGroup);
    map.drawCapitals(capitals);
  })
  // handler to catch any error when fetching data
  .catch(err => console.log("error fetching topojson:", err));

function getScale(min, max) {
  const scale = d3.scaleSequential(d3.interpolatePurples);
  scale.domain([min, max]);
  return scale;
}

function gdpPerCapita(country) {
  return (country.properties.gdp_md_est * 1e6) / country.properties.pop_est;
}

function getGdpPerCapitaRange(countries) {
  let min = Infinity;
  let max = -Infinity;

  countries.forEach(country => {
    const gpc = gdpPerCapita(country);
    if (gpc < min) {
      min = gpc;
    }
    if (gpc > max) {
      max = gpc;
    }
  });

  return { min, max };
}
