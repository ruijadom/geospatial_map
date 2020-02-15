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
}

d3.json("assets/data/custom.topo.json")
  .then(topology => {
    const map = new D3Map(topology);
    map.drawCountries();
  })
  // handler to catch any error when fetching data
  .catch(err => console.log("error fetching topojson:", err));
