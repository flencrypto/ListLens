"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function Page() {
  const [hasSentError, setHasSentError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-zinc-100">
      <h1 className="text-3xl font-semibold">sentry-example-page</h1>
      <p className="mt-3 text-zinc-400">
        Click the button below, and view the sample error on the Sentry{" "}
        <a
          className="text-cyan-400 underline"
          href="https://mrflen.sentry.io/issues/?project=javascript-nextjs"
          target="_blank"
          rel="noreferrer"
        >
          Issues page
        </a>
        . For more details about setting up Sentry,{" "}
        <a
          className="text-cyan-400 underline"
          href="https://docs.sentry.io/platforms/javascript/guides/nextjs/"
          target="_blank"
          rel="noreferrer"
        >
          read our docs
        </a>
        .
      </p>

      <button
        type="button"
        className="mt-8 rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500"
        onClick={async () => {
          // Reset state and assume the route is reachable until a network-level
          // failure proves otherwise. The example API route intentionally returns
          // 500, so we treat HTTP errors as "reachable" — only fetch rejection
          // (offline / DNS / blocked) means "not reachable".
          setHasSentError(false);
          setIsConnected(true);
          let routeReachable = true;

          try {
            await Sentry.startSpan(
              { name: "Example Frontend Span", op: "test" },
              async () => {
                try {
                  await fetch("/api/sentry-example-api");
                } catch {
                  routeReachable = false;
                  return;
                }

                throw new SentryExampleFrontendError(
                  "This error is raised on the frontend of the example page."
                );
              }
            );
          } catch (error) {
            Sentry.captureException(error);
          } finally {
            if (routeReachable) {
              setHasSentError(true);
            } else {
              setIsConnected(false);
            }
          }
        }}
      >
        Throw Sample Error
      </button>

      {hasSentError ? (
        <p className="mt-4 text-emerald-400">
          Sample error was sent to Sentry.
        </p>
      ) : !isConnected ? (
        <p className="mt-4 text-amber-400">
          The Sentry example route is not reachable. Check your DSN / network.
        </p>
      ) : null}
    </main>
  );
}
