'use client'
import {
    InstantSearch, SearchBox, Hits, RefinementList, ToggleRefinement, RangeInput, Menu, CurrentRefinements,
    useMenu, Pagination, SortBy, Stats, HitsPerPage
} from 'react-instantsearch';
import kydefault from 'ky';
// import 'instantsearch.css/themes/algolia.css';
import { MenuSelect } from './MenuList';
import { RangeSlider } from './RangeSlider';
import dayjs from "dayjs";
import { SearchClient } from 'algoliasearch';

//import 'instantsearch.css/themes/algolia.css';
const ky = kydefault.extend({
    //cache: 'force-cache',
    //mode: 'no-cors',
    retry: {
        limit: 3,
        delay: attemptCount => 0.3 * (2 ** (attemptCount - 1)) * 1000
    }
});
const yearFacets = async () => {
    const s = `SELECT RECEIVED_DATE_YEAR AS value, COUNT(1) AS count FROM 'db.parquet'
                GROUP BY RECEIVED_DATE_YEAR
                ORDER BY value`;
    const data = await ky(`https://duckdbedge.netlify.app/raw?q=${encodeURIComponent(s)}`).json<{ value: string; count: number; }[]>();
    facetMaps['timeframe'] = data;
    return data;
}
let facetMaps: Record<string, {
    value: string;
    count: number;
}[]> = {};
let companyFacetsAbortController: AbortController | null;
const parseFacetFilters = (facetFilters: [string[]]) => {
    const v = facetFilters.map(j => j.map(x => `${x.split(':')[0]}='${x.split(':')[1]}'`).join(' OR ')).map(j => `(${j})`).join(' AND ')
    return v ? `AND (${v})` : ''
}

const parseNumericFilters = (numericFilters: string[]) => {
    const v = numericFilters.join(' and ');
    return v ? `AND (${v})` : '';
}

const companyFacets = async (requests?: any) => {
    const q = requests && requests[0].params.facetQuery;
    // const numericFilters = requests && requests[0].params.numericFilters?.join(' and ') || '1=1';
    // const filter = requests && requests[0].params.facetFilters?.map(j => j.map(x => `${x.split(':')[0]}='${x.split(':')[1]}'`).join(' OR ')).map(j => `(${j})`).join(' AND ') || '1=1'
    const params = requests && requests[0].params;
    //if (!params) throw new Error('invalid params');

    let numericFilters = '';
    if (params?.numericFilters && Array.isArray(params.numericFilters)) {
        numericFilters = parseNumericFilters(params.numericFilters);
    }

    let filter = ''
    if (params?.facetFilters && Array.isArray(params.facetFilters)) {
        const f = params.facetFilters as [string[]];
        filter = parseFacetFilters(f);
    }

    console.log(`calling company facets with q: ${q}`);
    companyFacetsAbortController?.abort();
    companyFacetsAbortController = new AbortController();
    const facetQuery = q && `AND EMPLOYER_NAME ILIKE '%${q}%'`
    let errored = false;
    const s = `SELECT EMPLOYER_NAME AS value, COUNT(1) AS count FROM 
                (
                    SELECT *
                    FROM 'db.parquet'
                    WHERE 1=1
                    ${facetQuery || ''}
                    ${numericFilters}
                    ${filter}
                ) T1
                GROUP BY EMPLOYER_NAME
                --ORDER BY Count DESC
                LIMIT 25`;
    const data = await ky(`https://duckdbedge.netlify.app/raw?q=${encodeURIComponent(s)}`, {
        signal: companyFacetsAbortController.signal
    }).json<{ value: string; count: number; }[]>()
        .catch(() => { errored = true });
    if (!errored) {
        companyFacetsAbortController = null;
        data && (facetMaps['company'] = data);
    }
    return data || [];
}
declare type CustomHitType = { jobTitle: string, 
    employerName: string, 
    objectID: string, 
    payRangeStart: number, receivedDate: Date ,
    worksiteZip: string,
    worksiteState: string,
    payRangeEnd?: number
}
const numberFormatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    style: "currency",
    currency: 'USD'
})
function Hit({ hit }: { hit: CustomHitType }) {
    const payRange = numberFormatter.formatRange(hit.payRangeStart, hit.payRangeEnd || hit.payRangeStart);
    // <Card href="#" className="max-w-sm">
    return <div className="">
        <div className="min-w-0 flex-1">
            <p title={hit.employerName} className="truncate text-sm font-medium text-gray-900 dark:text-white">{hit.employerName}</p>
            <p title={hit.jobTitle} className="truncate text-sm text-gray-500 dark:text-gray-400">{hit.jobTitle}</p>
            <p className="items-center text-sm font-semibold text-gray-900 dark:text-white mt-2">
                {payRange}
            </p>
            <div className='flex truncate text-sm text-gray-400 dark:text-gray-400'>
                <p>{hit.worksiteState} {hit.worksiteZip}</p>
                <p className='flex'>{dayjs(hit.receivedDate).format("d MMM YYYY")}</p>
            </div>
        </div>
    </div>
    // </Card>
    // return <span>
    //     <span>{hit.employerName} -- {hit.jobTitle}, </span>
    //     <span>{numberFormatter.format(hit.payRangeStart)} -- {dayjs(hit.receivedDate).format("d MMM YYYY")}</span>
    // </span>
}


const sc = {
    async search(requests: any[]) {
        const { params } = requests[0];

        if (!params) throw new Error('invalid params');

        const q = params.query || 'facebook';
        let numericFilters = '';
        if (params.numericFilters && Array.isArray(params.numericFilters)) {
            numericFilters = parseNumericFilters(params.numericFilters);
        }

        let filter = ''
        if (params.facetFilters && Array.isArray(params.facetFilters)) {
            const f = params.facetFilters as [string[]];
            filter = parseFacetFilters(f);
        }

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
                            --AND (EMPLOYER_NAME ILIKE '%${q}%' OR JOB_TITLE ILIKE '%${q}%')
                            --AND RECEIVED_DATE > (current_date - 180)
                            ${numericFilters}
                            ${filter}
                            `;
        const resultsQuery = `${baseQuery} 
                                LIMIT ${perPage} OFFSET ${offset}`;
        const countsQuery = `SELECT COUNT(1) counts FROM (
                                ${baseQuery}
                            ) T`
        const resp = await ky(`https://duckdbedge.netlify.app/raw?q=${encodeURIComponent(resultsQuery)}`)
            .json<CustomHitType[]>()

        const resp_counts = await ky(`https://duckdbedge.netlify.app/raw?q=${encodeURIComponent(countsQuery)}`)
            .json<{ counts: number }[]>()
        const totalCount = resp_counts.pop()?.counts || 10;

        const companyFacetMaps = facetMaps['company'] || await companyFacets();
        const timeFrameFacetMaps = facetMaps['timeframe'] || await yearFacets();
        //https://github.com/algolia/instantsearch/tree/master/packages/algoliasearch-helper#results-format
        return {
            results: [
                {
                    "facets": {
                        "EMPLOYER_NAME": Object.assign({}, ...companyFacetMaps?.map(({ value, count }) => ({ [value]: count })) || [{}]),
                        "RECEIVED_DATE_YEAR": Object.assign({}, ...timeFrameFacetMaps?.map(({ value, count }) => ({ [value]: count })) || [{}])
                    },
                    "facets01": [
                        {
                            "name": 'company',
                            "data": Object.assign({}, ...companyFacetMaps?.map(({ value, count }) => ({ [value]: count })) || [{}]),
                            "exhaustive": true
                        },
                        {
                            "name": 'timeframe',
                            "data": Object.assign({}, ...timeFrameFacetMaps?.map(({ value, count }) => ({ [value]: count })) || [{}]),
                            "exhaustive": true
                        }
                    ],
                    "hits": resp,
                    "page": 0,
                    "nbHits": totalCount,
                    "nbPages": Math.ceil((totalCount / perPage)),
                    "hitsPerPage": perPage,
                    "processingTimeMS": 1,
                    "query": q
                }
            ]
        }
    },
    async searchForFacetValues(requests: any) {
        const { facetName } = requests[0].params;
        let data: { value: string, count: number }[] = [];

        switch (facetName) {
            case 'EMPLOYER_NAME':
                data = await companyFacets(requests);
                break;
            case 'RECEIVED_DATE_YEAR':
                data = await yearFacets()
                break;
            default:
                throw new Error('invalid facet name');
        }

        return {
            "facetHits": data.map(({ value, count }) => ({ value, count, highlighted: `${value}` })),
            "exhaustiveFacetsCount": true,
            "exhaustive": {
                "facetsCount": true
            },
            "processingTimeMS": 1
        }
    }
};

export const Search = () => {
    return <InstantSearch searchClient={sc as unknown as SearchClient} indexName="YourIndexName">
        <div className='search-panel h-full min-h-svh'>
            <div className="search-panel__filters fixed inset-0 z-50 h-full w-64 flex-none border-r border-gray-200 dark:border-gray-600 lg:static lg:block lg:h-auto lg:overflow-y-visible 
            lg:pt-6 hidden">
                <div className='overflow-y-auto px-4 h-full
                        scrolling-touch max-w-2xs  lg:block dark:bg-gray-900 
                        lg:mr-0 lg:sticky font-normal text-base lg:text-sm'>

                    <SortBy items={[{
                        label: 'Received Date',
                        value: 'RECEIVED_DATE_YEAR'
                    }, {
                        label: 'Pay Start',
                        value: 'WAGE_RATE_OF_PAY_FROM'
                    }]}></SortBy>
                    <RefinementList attribute="EMPLOYER_NAME"
                        searchable={true}
                        showMore={true}
                        showMoreLimit={25}
                        limit={10}
                        searchablePlaceholder='Search company...' />
                    <hr></hr>
                    <ToggleRefinement label='Change of Employment?' attribute='CHANGE_EMPLOYER' on={1}></ToggleRefinement>
                    <div style={{ margin: '0px 0px 30px 0' }}>
                        <div style={{ margin: "10px 0px" }}>Salary:</div>
                        <RangeSlider min={10000} max={1000000} attribute="WAGE_RATE_OF_PAY_FROM" />
                    </div>
                    <MenuSelect attribute='RECEIVED_DATE_YEAR'></MenuSelect>
                </div>
            </div>
            <div className="search-panel__results w-full min-w-0 pr-5 lg:pt-6">
                <CurrentRefinements></CurrentRefinements>

                {/* <SearchBox></SearchBox> */}
                <Hits hitComponent={Hit} classNames={{
                    root: 'py-5',
                    list: '',
                    item: 'p-2 m-1'
                }} />
                <HitsPerPage items={[{
                    label: '12',
                    value: 12,
                    default: true
                }, {
                    label: '16',
                    value: 16,
                    default: false
                }]}></HitsPerPage>
                <Stats></Stats>
                <Pagination ></Pagination>

            </div>
            {/* <RangeInput attribute='salary' min={50000} max={500000}></RangeInput> */}
        </div>

    </InstantSearch>
}