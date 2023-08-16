const path = require("path");

const entrypoints = [
  "build-page",
  "build-page-minimal",
  "special/archive",
  "special/calculator",
  "special/dice",
  "special/emwaves",
  "special/escapejs",
  "special/infection",
  "special/matrices",
  "special/oldcomplex",
  "special/pacscript",
  "special/quadratic",
  "special/calculator-ii/calculator.page",
  "special/covid/dashboard.page",
  "special/creatures/summons.page",
  "special/nodes/nodes.page",
  "special/npcs/dice-histogram.page",
  "special/npcs/npc-creator",
  "special/npcs/npc-generator",
  "special/npcs/npc-initiative-tracker",
  "special/npcs/npcs-names-list",
  "special/pacman-new/pacman.page",
  "special/resume/resume.page",
  "special/showcase/showcase.page",
  "special/vectors/vectors",
  "special/wires/wires-v1",
  "special/wires/wires",
  "special/wordle/wordle.page",
  "owi_scroll_to_top",
].reduce((map, path) => ({
  ...map,
  [`${path}`]: `./ts-scripts/${path}`,
}), {});

module.exports = {
  entry: entrypoints,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "scripts"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                ["@babel/preset-react", { targets: "defaults" }],
              ],
            },
          },
          "ts-loader",
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
};
