'use client';
import { Card, Title, LineChart } from "@tremor/react";
import { useDbQuery } from '../lib/db';
import { useMemo } from "react";
import { BaseParam } from "./common";
import dayjs from "dayjs";

export const CompanyLineChart = ({range}: BaseParam) => {
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

    let finalData: any[] = useMemo(() => {
        if (!data) return [];
        return data.map(item => {
            const r: any = { dt: item.dt };
            Object.keys(item.histogram).forEach(k => r[k] = parseInt(item.histogram[k]));
            return r;
        });
    }, [data]);
    let uniqueAttributes = useMemo(() => [...new Set(data?.map(j => Object.keys(j.histogram)).flat())], [data]);
    
    return <Card>
        <Title>Number of petitions by top companies</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            curveType="monotone"
            connectNulls={true} />
    </Card>;
};


export const CompanyLineAvgSalaryChart = ({range}: BaseParam) => {
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
       
       select strftime(gp1.bucket , '%b %Y') as dt, histogram(gp1.name) as histogram
       from gp1 JOIN empList on gp1.name = empList.name 
       group by gp1.bucket
       order by bucket
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string; histogram: any }>(q);

    let finalData: any[] = useMemo(() => {
        if (!data) return [];
        return data.map(item => {
            const r: any = { dt: item.dt };
            Object.keys(item.histogram).forEach(k => r[k] = parseInt(item.histogram[k]));
            return r;
        });
    }, [data]);
    let uniqueAttributes = useMemo(() => [...new Set(data?.map(j => Object.keys(j.histogram)).flat())], [data]);
    
    return <Card>
        <Title>Number of petitions by top companies</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            curveType="monotone"
            showAnimation={true}
            connectNulls={true} />
    </Card>;
};


