import { Redirect } from "expo-router";

/**
 * Root route — sends every fresh launch to the animated List-LENS splash gate.
 * The splash gate is intentionally shown on every cold launch and Replay Splash.
 */
export default function Index() {
  return <Redirect href="/splash" />;
}