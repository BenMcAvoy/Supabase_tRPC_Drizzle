import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { trpc } from "./trpc";
import { supabase } from "./lib/supabase/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError && error.data?.httpStatus === 401) {
          return false;
        }

        return failureCount < 3;
      },
    },
  },
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/trpc",
      async headers() {
        const { data } = await supabase.auth.getSession();
        return data.session
          ? { authorization: `Bearer ${data.session.access_token}` }
          : {};
      },
    }),
  ],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
