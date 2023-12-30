'use client'
import kydefault from "ky"
import useSWR from "swr";

const ky = kydefault.extend({
    retry: {
        limit: 3,
        delay: attemptCount => 0.3 * (2 ** (attemptCount - 1)) * 1000
    }
});

export const query = async <T>(q: string, options?: { signal: AbortSignal | undefined | null }) =>
    ky(`https://hpqdata.deno.dev/raw?q=${encodeURIComponent(q)}`, options).json<T[]>();

export const queryFirst = async <T>(q: string, options?: { signal: AbortSignal | undefined | null }) => {
    const result = await ky(`https://hpqdata.deno.dev/raw?q=${encodeURIComponent(q)}`, options).json<T[]>();
    if (result.length >= 1) return result[0];
    throw new Error(`empty array received.`);
}


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