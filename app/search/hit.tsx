import React from "react";
import dayjs from "dayjs";
import { Card, CustomFlowbiteTheme } from 'flowbite-react';

export type CustomHitType = { jobTitle: string, 
    employerName: string, 
    objectID: string, 
    payRangeStart: number, receivedDate: Date ,
    worksiteZip: string,
    worksiteState: string,
    payRangeEnd?: number
}

// import { NumberFormat } from '@formatjs/intl-numberformat'
import { NumberFormatter } from '@internationalized/number'

const numberFormatter = new NumberFormatter('en', {
    notation: 'compact',
    style: "currency",
    currency: 'USD'
})

export const Hit=({ hit }: { hit: CustomHitType }) =>{
    const payRange = numberFormatter.formatRange(hit.payRangeStart, hit.payRangeEnd || hit.payRangeStart);
    // <Card href="#" className="max-w-sm">

const compactCardTheme: CustomFlowbiteTheme['card'] = {
    root: {
        'children': 'flex h-full flex-col justify-center gap-4 p-4'
    }
};

return <Card theme={compactCardTheme} className="max-w-sm ">
     <div className="min-w-0 flex-1">
        <p title={hit.employerName} className="truncate text-sm font-medium text-gray-900 dark:text-white">{hit.employerName}</p>
        <p title={hit.jobTitle} className="truncate text-sm text-gray-500 dark:text-gray-400">{hit.jobTitle}</p>
        <p className="items-center text-sm font-semibold text-gray-900 dark:text-white mt-2">
            {payRange}
        </p>
        <div className='flex justify-between truncate text-sm text-gray-400 dark:text-gray-400'>
            <div>{hit.worksiteState} {hit.worksiteZip}</div>
            <div className='flex'>{dayjs(hit.receivedDate).format("d MMM YY")}</div>
        </div>
    </div>
    </Card>
}
