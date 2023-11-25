import { MIN_FONT_SCALE } from "../models";
import { splitTabIntoColumns } from "./tab";
import { faker } from "@faker-js/faker";

describe("Tab splitter", () => {
  it("creates columns no bigger than max size", () => {
    const maxLength = 10;
    const columns = splitTabIntoColumns(
      faker.lorem.sentences(300).split("."),
      10,
      MIN_FONT_SCALE
    );

    expect(columns[0].length).toBeLessThanOrEqual(maxLength);
  });

  it("removes exactly one line from a column when every line is a chord", () => {
    const maxLength = 10;
    const chords = [...Array(500).keys()].map(() => "[ch]");
    const columns = splitTabIntoColumns(chords, 10, MIN_FONT_SCALE);

    expect(columns[0].length).toStrictEqual(maxLength - 1);
    columns.map((column) => expect(column.length).toBeLessThan(maxLength));
  });
});
