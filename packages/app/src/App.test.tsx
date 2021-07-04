import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  render(<App />);
});

xtest("renders the home page", () => {
  const titleElement = screen.getByText(/ride or die/i);
  expect(titleElement).toBeInTheDocument();

  const connectWalletButton = screen.getByText(/connect wallet/i);
  expect(connectWalletButton).toBeInTheDocument();

  const linkStravaButton = screen.getByText(/link strava/i);
  expect(linkStravaButton).toBeInTheDocument();
});
