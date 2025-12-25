"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { toast, Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (err) => {
          if (err.message === "NEXT_REDIRECT") return;
          toast.error(err.message);
        },
        onSuccess: () => {
          toast.success("Operation successful");
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
export { Providers };
