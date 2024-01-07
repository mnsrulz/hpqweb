import { CustomHitType } from "./hit";
import { query, queryFirst } from './../lib/socket'

let scSignal: AbortController | null;
let facetSearchSignalMap = new Map<string, AbortController>();

const parseFacetFilters = (facetFilters: [string[]]) => {
    const v = facetFilters.map(j => j.map(x => `${x.split(':')[0]}='${x.split(':')[1]}'`).join(' OR ')).map(j => j && `(${j})`).join(' AND ')
    return v ? `AND (${v})` : ''
}

const parseNumericFilters = (numericFilters: string[]) => {
    const v = numericFilters.join(' and ');
    return v ? `AND (${v})` : '';
}

const buildFilter = (facetFilters: [string[]], numericFilters: string[]) => {
    let numFilters = '', filter = '';
    if (numericFilters && Array.isArray(numericFilters)) {
        numFilters = parseNumericFilters(numericFilters);
    }

    if (facetFilters && Array.isArray(facetFilters)) {
        filter = parseFacetFilters(facetFilters);
    }

    return `
        ${filter}
        ${numFilters}
        `;
}

const facetSearchMethod = async (requests: any, facetName: string, signal: AbortSignal) => {
    //this is when you get from global search //requests.find(r=>r.params.facets == 'EMPLOYER_NAME')
    //this is when that particular facet is being searched //requests.find(r=>r.params.facetName == 'EMPLOYER_NAME')
    const facetRequest = requests.find((r: any) => r.params.facetName == facetName || r.params.facets == facetName);
    let q = '';
    let facetFilters: [string[]] = [[]];
    let numericFilters: string[] = [];
    if (facetRequest) {
        facetFilters = facetRequest.params.facetFilters;
        numericFilters = facetRequest.params.numericFilters;
        q = facetRequest.params.facetQuery;
    } else {
        facetFilters = requests[0].params.facetFilters;
        numericFilters = requests[0].params.numericFilters;
    }
    const filter = buildFilter(facetFilters, numericFilters);

    const facetQuery = q && `AND ${facetName} ILIKE '%${q}%'`
    const s = `SELECT ${facetName} AS value, COUNT(1) AS count FROM 
                (
                    SELECT *
                    FROM 'db.parquet'
                    WHERE 1=1
                    ${facetQuery || ''}
                    ${filter}
                ) T1
                GROUP BY ${facetName}
                ORDER BY Count DESC
                LIMIT 10`;

    const data = await query<{ value: string, count: number }>(s, { signal });
    return { data: data || [], facetName };
}

const searchMainMethod = async (requests: any[]) => {
    const p1 = performance.now();
    scSignal?.abort();
    const currentController = new AbortController();
    const { signal } = currentController;
    scSignal = currentController;
    const { params } = requests[0];
    if (!params) throw new Error('invalid params');

    const filter = buildFilter(params.facetFilters, params.numericFilters);

    const perPage = params.hitsPerPage || 12;
    const offset = (params.page || 0) * perPage;
    const baseQuery = `SELECT JOB_TITLE AS jobTitle, EMPLOYER_NAME as employerName, 
    CASE_NUMBER AS objectID, RECEIVED_DATE_YEAR,
    WAGE_RATE_OF_PAY_FROM AS payRangeStart, 
    WAGE_RATE_OF_PAY_TO AS payRangeEnd, 
    CAST(RECEIVED_DATE AS DATE) AS receivedDate,
    WORKSITE_STATE AS worksiteState, WORKSITE_POSTAL_CODE as worksiteZip
    FROM 'db.parquet'
    WHERE 1=1
    ${filter}
    `;
    const resultsQuery = `${baseQuery} 
    LIMIT ${perPage} OFFSET ${offset}`;
    const countsQuery = `SELECT COUNT(1) counts FROM (
        ${baseQuery}
        ) T`

    const [resultsPromise, countsPromise] = [
        query<CustomHitType>(resultsQuery, { signal }),
        queryFirst<{ counts: number }>(countsQuery, { signal })
    ];

    const facetSearches = [
        facetSearchMethod(requests, 'EMPLOYER_NAME', signal),
        facetSearchMethod(requests, 'SOC_TITLE', signal),
        facetSearchMethod(requests, 'WORKSITE_STATE', signal),
        facetSearchMethod(requests, 'RECEIVED_DATE_YEAR', signal)
    ];
    await Promise.all([resultsPromise, countsPromise, ...facetSearches])

    const resp = await resultsPromise;
    const { counts } = await countsPromise;
    const rs = await Promise.all(facetSearches);

    const facets = Object.assign({}, ...rs.map(({ facetName, data }) => ({
        [facetName]: Object.assign({}, ...data?.map(({ value, count }) => ({ [value]: count })) || [{}])
    })));

    const p2 = performance.now();
    //https://github.com/algolia/instantsearch/tree/master/packages/algoliasearch-helper#results-format
    return {
        results: [
            {
                facets,
                "hits": resp,
                "page": 0,
                "nbHits": counts,
                "nbPages": Math.ceil((counts / perPage)),
                "hitsPerPage": perPage,
                "processingTimeMS": p2 - p1
            }
        ]
    }
}

let lastKnownResult: any;
let lastKnowFacetResultMap = new Map<string, any>();
export const sc = {
    async search(requests: any[]) {
        try {
            lastKnownResult = await searchMainMethod(requests);
        } catch (error) {
        }
        return lastKnownResult;
    },
    async searchForFacetValues(requests: any) {
        const { facetName } = requests[0].params;
        try {
            facetSearchSignalMap.get(facetName)?.abort();
            const ac = new AbortController();
            facetSearchSignalMap.set(facetName, ac);
            switch (facetName) {
                case 'EMPLOYER_NAME':
                case 'SOC_TITLE':
                case 'WORKSITE_STATE':
                case 'RECEIVED_DATE_YEAR':
                    const { data } = await facetSearchMethod(requests, facetName, ac.signal);
                    lastKnowFacetResultMap.set(facetName, {
                        "facetHits": data.map(({ value, count }) => ({ value, count, highlighted: `${value}` })),
                        "exhaustiveFacetsCount": true,
                        "exhaustive": {
                            "facetsCount": true
                        },
                        "processingTimeMS": 1
                    });
                default:
                    throw new Error('invalid facet name');
            }
        } catch (error) {

        }
        return lastKnowFacetResultMap.get(facetName);
    }
};