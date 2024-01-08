'use client'
import {
    InstantSearch, Hits, RefinementList, ToggleRefinement, CurrentRefinements,
    Pagination, Stats, HitsPerPage
} from 'react-instantsearch';
import { MenuSelect } from '../MenuList';
import { RangeSlider } from '../RangeSlider';
import { SearchClient } from 'algoliasearch';
import { Hit } from './hit'
import './search.css';
import { sc } from './searchClient';
import { Button, Modal, Select } from 'flowbite-react';
import { useState } from 'react';
import {MdFilterList, MdOutlineClear} from 'react-icons/md'
import React from 'react';

const FilterPanel = ()=>{
    return <><MenuSelect attribute='RECEIVED_DATE_YEAR'></MenuSelect>
    <RefinementList attribute="EMPLOYER_NAME"
        searchable={true}
        showMore={true}
        showMoreLimit={25}
        limit={5}
        searchablePlaceholder='Search company...' />
    <RefinementList attribute="SOC_TITLE"
        searchable={true}
        showMore={true}
        showMoreLimit={25}
        limit={5}
        searchablePlaceholder='Search job title...' />
    <RefinementList attribute="WORKSITE_STATE"
        searchable={true}
        showMore={true}
        showMoreLimit={25}
        limit={5}
        searchablePlaceholder='Search worksite state...' />
    <ToggleRefinement label='Change of Employment?' attribute='CHANGE_EMPLOYER' on={1}></ToggleRefinement>
    <div style={{ margin: '0px 0px 30px 0' }}>
        <div style={{ margin: "10px 0px" }}>Salary:</div>
        <RangeSlider min={10000} max={1000000} attribute="WAGE_RATE_OF_PAY_FROM" />
    </div></>
    {/* <SortBy items={[{
        label: 'Received Date',
        value: 'RECEIVED_DATE_YEAR'
    }, {
        label: 'Pay Start',
        value: 'WAGE_RATE_OF_PAY_FROM'
    }]}></SortBy> */}
}
const initialUiState = {
    'ix': {
        // query: 'stick',
        menu: {
            RECEIVED_DATE_YEAR: '2023'
        }
    }
};

export const Search = () => {
    const [shouldShowFilterMenu, setShowFilterMenu] = useState(false);
    const showFilterMenu = ()=>setShowFilterMenu(true);
    const closeFilterMenu = ()=>setShowFilterMenu(false);
    const fm = <FilterPanel />

    return <InstantSearch searchClient={sc as unknown as SearchClient} indexName="ix" routing={true} initialUiState={initialUiState} >
            <div className="search-panel__filters w-80 absolute sm:relative bg-white-800 shadow md:h-full flex-col justify-between hidden sm:flex">
                <div className='p-2 md:px-4 lg:px-4'>
                    <div className='h-full'>
                        {fm}
                    </div>
                </div>
            </div>
            
            
            <div className={`fixed top-0 right-0 z-50 flex flex-col bg-white dark:bg-gray-700 h-dvh transition-all delay-150 duration-300 w-screen sm:hidden
                                ${shouldShowFilterMenu ? 'left-0' : '-left-full'}`}>
                <div className="mb-2 flex justify-between rounded-t dark:border-gray-600 border-b p-4">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Filters</h3>
                    <Button aria-label="Close" size="xs" onClick={closeFilterMenu} className="ml-auto bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900" type="button">
                        <MdOutlineClear className="h-4 w-4"/>
                    </Button>
                </div>
                <div className='p-4 overflow-y-auto overflow-x-hidden'>
                    {fm}
                </div>
                {/* Modal footer */}
                {/* <div className="flex justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
                    <Button onClick={closeFilterMenu}>Ok</Button>
                </div> */}
                    {/* <button data-modal-hide="static-modal" onClick={closeFilterMenu} type="button" 
                    className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Ok</button> */}
            </div>
            
            <div className="px-4 md:w-4/5 ">
                <div className='mx-1 flex sm:hidden'>
                    <Button onClick={showFilterMenu}><MdFilterList /></Button>
                </div>

                <CurrentRefinements className='hidden sm:flex' classNames={{
                    categoryLabel: 'm-1',
                    item: 'rounded-md bg-indigo-900 text-white text-sm p-1 m-1 inline-flex',
                }}></CurrentRefinements>

                {/* <SearchBox></SearchBox> */}
                <Hits hitComponent={Hit} />
                <div className='md:flex justify-between'>
                    <Stats></Stats>
                    <HitsPerPage className='hidden md:flex' items={[{
                        label: '12',
                        value: 12,
                        default: true 
                    }, {
                        label: '16',
                        value: 16,
                        default: false
                    }]} classNames={{
                        root: '',
                        select: 'bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    }}></HitsPerPage>

                    <Pagination  
                    showFirst={false}
                    showLast={false}
                    classNames={{
                        root: 'Page navigation example',
                        list: 'inline-flex -space-x-px text-sm',
                        item: '',
                        pageItem: '',
                        selectedItem: '',
                        link: ' '
                    }}></Pagination>
                </div>
            </div>
            {/* <RangeInput attribute='salary' min={50000} max={500000}></RangeInput> */}

    </InstantSearch>
}
