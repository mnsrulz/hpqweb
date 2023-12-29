'use client';
import { Card, Title, LineChart } from "@tremor/react";
import { useDbQuery } from '../lib/db';
import { BaseParam, usdValueFormatter } from "./common";
import dayjs from "dayjs";



export const AvgSalaryByState = ({range}: BaseParam) => {
    const q = `WITH top_states as (
        SELECT WORKSITE_STATE as name FROM 'db.parquet'
        WHERE RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
        group by name 
        order by count(1) DESC
        LIMIT 15
        ), gp1 as (
                SELECT WORKSITE_STATE AS name, COUNT(1) AS count, date_trunc('month', RECEIVED_DATE) as bucket
                , floor(avg(WAGE_RATE_OF_PAY_FROM)) as avg_start 
                FROM 'db.parquet'
                WHERE WAGE_UNIT_OF_PAY ILIKE 'YEAR'
                AND RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
                GROUP BY name, bucket
                )
               select gp1.name, count, strftime(bucket , '%b %Y') as dt, avg_start  
               from gp1 join top_states on gp1.name = top_states.name
               order by bucket
              --limit 100
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string; avg_start: number; name: string; count: number; }>(q);

    let finalData: any[] = [];
    let uniqueAttributes: string[] = [];
    if (data) {
        const o: { [id: string]: any; } = {};
        for (const item of data) {
            o[item.dt] = o[item.dt] || { dt: item.dt };
            const pitem = o[item.dt];
            pitem[item.name] = item.avg_start;
        }
        uniqueAttributes = [...new Set(data.map(j => j.name))]; //data.map(j => j.name).filter((x, i, a) => a.indexOf(x) == i);
        finalData = Object.values(o);
    }

    return <Card>
        <Title>Average salary by top states</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            valueFormatter={usdValueFormatter}
            curveType="monotone"
            showAnimation={true}
            enableLegendSlider={true}
            connectNulls={true} />
    </Card>;
};
