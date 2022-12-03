export function mockMatchMedia() {
  global.matchMedia =
    global.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
}
