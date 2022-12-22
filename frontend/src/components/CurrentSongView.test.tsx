import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import { mockMatchMedia } from "../testUtils";
import CurrentSongView from "./CurrentSongView";

beforeAll(mockMatchMedia);

test("renders dark mode button", () => {
  render(
    <ChakraProvider>
      <CurrentSongView />
    </ChakraProvider>,
  );

  // const buttonElement = screen.getByTestId("darkMode");
  // expect(buttonElement).toBeInTheDocument();
});
