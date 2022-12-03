import { prettyDOM, render, screen } from "@testing-library/react";
import CurrentSongView from "./CurrentSongView";
import { ChakraProvider } from "@chakra-ui/react";
import { mockMatchMedia } from "../testUtils";
import userEvent from "@testing-library/user-event";

beforeAll(mockMatchMedia);

test("renders dark mode button", () => {
  render(
    <ChakraProvider>
      <CurrentSongView />
    </ChakraProvider>
  );

  const buttonElement = screen.getByTestId("darkMode");
  expect(buttonElement).toBeInTheDocument();
});
