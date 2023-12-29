'use client'
import kydefault from "ky"
import useSWR from "swr";

const ky = kydefault.extend({
    retry: {
        limit: 3,
        delay: attemptCount => 0.3 * (2 ** (attemptCount - 1)) * 1000
    }
});

export const query = async <T>(q: string) =>
    ky(`https://hpqdata.deno.dev/raw?q=${encodeURIComponent(q)}`).json<T[]>();

const fetcher = async <T>(q: string) =>
ky(`https://hpqdata.deno.dev/raw?q=${encodeURIComponent(q)}`).json<T[]>();

export const useDbQuery = <T>(q: string) => {
    const { data, error, isLoading } = useSWR<T[]>(q, fetcher);
    return {
        data,
        isLoading,
        error,
    };
}