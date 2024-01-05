import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

const URL = `https://hpqdata-socket-deno.deno.dev`

export const socket = io(URL, {
    reconnectionDelayMax: 10000,
    // transports: ['websocket']
});

socket.on("connect", () => {
    console.log("Connected")
})


export const query = async <T>(q: string, options?: { signal: AbortSignal | undefined | null }) => {
    const requestId = crypto.randomUUID()
    console.log(`calling query: \n${q}`);
    return new Promise<T[]>((res, rej) => {
        const objecToSend = {
            q,
            requestId
        }
        const handler = (args: { result: any }) => {
            res(args.result)
        }
        //queryResults.value.push(objecToSend)
        socket.emit('query', objecToSend);

        options?.signal?.addEventListener('abort', () => {
            console.log(`cancelling the request: ${requestId}`)
            socket.off(`query-response-${requestId}`, handler);
            socket.emit('cancelQuery', {
                requestId
            });
            rej('abort requested!');
        });

        socket.once(`query-response-${requestId}`, handler);
    })
}
//ky(`https://hpqdata.deno.dev/raw?q=${encodeURIComponent(q)}`, options).json<T[]>();

export const queryFirst = async <T>(q: string, options?: { signal: AbortSignal | undefined | null }) => {
    const result = await query<T>(q, options);
    if (result.length >= 1) return result[0];
    throw new Error(`empty array received.`);
}