import { useState, useEffect } from "react";
import { API_DOMAIN } from "../env";

export interface SuggestedPlace {
  rank: number;
  name: string;
  city: string;
  street: string;
  formatted: string;
  lat: number;
  lon: number;
}

export function usePlaceSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_DOMAIN}/api/autocomplete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: query }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch place suggestions");
        }

        const data = (await response.json()) as {
          status: string;
          payload: SuggestedPlace[];
        };

        if (isMounted) {
          setSuggestions(data.payload);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted && err instanceof Error && err.name !== "AbortError") {
          setError(err);
        }
      }
    };

    // Debounce API call
    const timeoutId = setTimeout(() => {
      void fetchSuggestions();
    }, 300);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { suggestions, isLoading, error };
}
