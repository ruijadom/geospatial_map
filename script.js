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
      .attr("stroke", "white")
      .attr("fill", "lightgray");

    return countryGroup;
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
    map.drawCountries();
    map.drawCapitals(capitals);
  })
  // handler to catch any error when fetching data
  .catch(err => console.log("error fetching topojson:", err));
