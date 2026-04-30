import { Redirect } from "expo-router";

/**
 * Root route — sends a fresh launch to the animated splash. The splash itself
 * exposes a "Skip" link straight into the dashboard.
 */
export default function Index() {
  return <Redirect href="/splash" />;
}
