'use client'
import { Grid, DateRangePicker, DateRangePickerItem, DateRangePickerValue, Col } from "@tremor/react";
import { AvgSalaryByState } from "./AvgSalaryByState";
import { CompanyLineChart, CompanyLineAvgSalaryChart } from "./CompanyLineChart";
import { CompanyTotalPetitions } from "./CompanyTotalPetitions";
import { TotalPetitions } from "./TotalPetitions";
import { useState } from "react";

const preSelectedDateRanges = [2019, 2020, 2021, 2022, 2023].map(j => (
    <DateRangePickerItem key={j} value={`${j}`} from={new Date(j, 0, 1)} to={new Date(j, 11, 31)}>
        {j}
    </DateRangePickerItem>)
);
export default function Page() {
    const [value, setValue] = useState<DateRangePickerValue>({
        from: new Date(2023, 0, 1),
        to: new Date(2023, 11, 31)
    });

    return <Grid numItems={1} numItemsMd={2} numItemsLg={4} className="gap-2 mx-4">
        <Col numColSpan={4} className="flex justify-end">
            <DateRangePicker
                className="max-w-md "
                value={value}
                onValueChange={setValue}
                enableClear={false}
                color="rose">
                {preSelectedDateRanges}
            </DateRangePicker>
        </Col>
        <Col numColSpan={2}>
            <TotalPetitions range={value} />
        </Col>
        <Col numColSpan={2}>
            <CompanyTotalPetitions range={value} />
        </Col>
        <Col numColSpan={4}>
            <CompanyLineAvgSalaryChart range={value} />
        </Col>
        <Col numColSpan={4}>
            <AvgSalaryByState range={value} />
        </Col>
    </Grid>
}