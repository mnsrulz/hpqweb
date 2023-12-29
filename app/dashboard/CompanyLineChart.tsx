'use client';
import { Card, Title, LineChart } from "@tremor/react";
import { useDbQuery } from '../lib/db';
import { useMemo } from "react";
import { BaseParam, usdValueFormatter } from "./common";
import dayjs from "dayjs";

export const CompanyLineChart = ({ range }: BaseParam) => {
    const q = `WITH gp1 as (
        SELECT EMPLOYER_NAME AS name, date_trunc('month', RECEIVED_DATE) as bucket 
        FROM 'db.parquet'
        WHERE CASE_STATUS = 'Certified'
        AND RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
       ),cte AS (
       SELECT name, row_number() OVER (PARTITION BY bucket ORDER BY count(1) desc) as rn, count(1) as count 
       FROM gp1
       GROUP BY name, bucket
       ), empList as (
       select DISTINCT name 
       From cte 
       order by count desc 
       limit 12)
       
       select strftime(gp1.bucket , '%b %Y') as dt , histogram(gp1.name) as histogram
       from gp1 JOIN empList on gp1.name = empList.name 
       group by gp1.bucket
       order by bucket
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string; histogram: any }>(q);

    let finalData: any[] = useMemo(() => data?.map(({ dt, histogram }) => ({ dt, ...histogram })) || [], [data]);
    let uniqueAttributes = useMemo(() => [...new Set(data?.map(j => Object.keys(j.histogram)).flat())], [data]);

    return <Card>
        <Title>Number of petitions by top companies</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            enableLegendSlider={true}
            curveType="monotone"
            connectNulls={true} />
    </Card>;
};


export const CompanyLineAvgSalaryChart = ({ range }: BaseParam) => {
    const q = `WITH gp1 as (
        SELECT EMPLOYER_NAME AS name, date_trunc('month', RECEIVED_DATE) as bucket, WAGE_RATE_OF_PAY_FROM 
        FROM 'db.parquet'
        WHERE CASE_STATUS = 'Certified'
        AND RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
       ),cte AS (
       SELECT name,bucket, CAST(avg(WAGE_RATE_OF_PAY_FROM) as integer) as avg_sal,
row_number() OVER (PARTITION BY bucket ORDER BY avg(WAGE_RATE_OF_PAY_FROM)  desc) as rn,
count(1) as count  
       FROM gp1
       GROUP BY name, bucket
       ), topEmployees as (
        select DISTINCT name 
       From cte 
       order by count desc 
       limit 12
       ), empList as (
       select name, bucket, avg_sal 
       From cte WHERE name in (select name from topEmployees)
       order by avg_sal desc 
), t1 as (
       
       select gp1.bucket, gp1.name, empList.avg_sal
       from gp1 JOIN empList on gp1.name = empList.name AND gp1.bucket = emplist.bucket
       group by gp1.bucket, gp1.name,avg_sal)

select strftime(bucket , '%b %Y') as dt, map(list(name), list(avg_sal)) as histogram from t1
group by bucket
order by bucket 
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string; histogram: any }>(q);

    let finalData: any[] = useMemo(() => data?.map(({ dt, histogram }) => ({ dt, ...histogram })) || [], [data]);
    let uniqueAttributes = useMemo(() => [...new Set(data?.map(j => Object.keys(j.histogram)).flat())], [data]);

    return <Card>
        <Title>Average salary by top companies</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            curveType="monotone"
            showAnimation={true}
            valueFormatter={usdValueFormatter}
            enableLegendSlider={true}
            connectNulls={true} />
    </Card>;
};


