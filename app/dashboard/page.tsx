'use client'
import { Card, Text, Metric, BarList, Bold, Flex, Title, Col, LineChart } from "@tremor/react";
import { useDbQuery } from '../lib/db'
import { Grid } from "@tremor/react";
import { AreaChart } from "@tremor/react";
import { useEffect, useState } from "react";

const valueFormatter = (v: number) => `$ ${new Intl.NumberFormat("us", { currency: 'USD', compactDisplay: 'short', notation: 'compact' }).format(v).toString()}`;

const StateWiseChart = () => {
    const q = `WITH top_states as (
        SELECT WORKSITE_STATE as name FROM 'db.parquet'
        group by name 
        order by count(1) DESC
        LIMIT 15
        ), gp1 as (
                SELECT WORKSITE_STATE AS name, COUNT(1) AS count, date_trunc('month', RECEIVED_DATE) as bucket
                , floor(avg(WAGE_RATE_OF_PAY_FROM)) as avg_start 
                FROM 'db.parquet'
                WHERE WAGE_UNIT_OF_PAY ILIKE 'YEAR'
                GROUP BY name, bucket
                )
               select gp1.name, count, strftime(bucket , '%b %Y') as dt, avg_start  
               from gp1 join top_states on gp1.name = top_states.name
               order by bucket
              --limit 100
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string, avg_start: number, name: string, count: number }>(q);

    let finalData: any[] = []
    let uniqueAttributes: string[] = []
    if (data) {
        const o: { [id: string]: any } = {};
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
            valueFormatter={valueFormatter}
            connectNulls={true} />
    </Card>
}

const CompanyLineChart = () => {
    const q = `WITH gp1 as (
        SELECT EMPLOYER_NAME AS name, COUNT(1) AS count, date_trunc('month', RECEIVED_DATE) as bucket FROM 'db.parquet' GROUP BY name, bucket
       ),cte AS (
       SELECT name, row_number() OVER (PARTITION BY bucket ORDER BY count desc) as rn FROM gp1
       ), empList as (
       select * From cte where rn < 2)
       
       select gp1.name, gp1.count, strftime(gp1.bucket , '%b %Y') as dt 
       from gp1 JOIN empList  on gp1.name = empList.name order by bucket
       --limit 10
       `;
    const { data, error, isLoading } = useDbQuery<{ dt: string, bucket: Date, name: string, count: number }>(q);
    //const [finalData, setFinalData] = useState([]);

    let finalData: any[] = []
    let uniqueAttributes: string[] = []
    if (data) {
        const o: { [id: string]: any } = {};
        for (const item of data) {
            //debugger;
            o[item.dt] = o[item.dt] || { bucket: item.bucket, dt: item.dt };
            const pitem = o[item.dt];
            pitem[item.name] = item.count;
        }
        uniqueAttributes = [...new Set(data.map(j => j.name))]; //data.map(j => j.name).filter((x, i, a) => a.indexOf(x) == i);
        finalData = Object.values(o);
    }

    return <Card>
        <Title>Number of petitions by top companies</Title>
        <LineChart
            className="mt-6"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            yAxisWidth={40}
            connectNulls={true} />
    </Card>
}

const CountsByYear = () => {
    const q = `select EMPLOYER_NAME as name, count(1) as value from 'db.parquet' 
                GROUP BY name 
                ORDER BY value desc
                LIMIT 5`;
    const { data, error, isLoading } = useDbQuery<{ name: string, value: number }>(q);

    const chart = (data && <BarList data={data} className="mt-2" />)
    return <Card>
        <Title>Top 5 Companies petition counts</Title>
        <Flex className="mt-4">
            <Text>
                <Bold>Company</Bold>
            </Text>
            <Text>
                <Bold>Count</Bold>
            </Text>
        </Flex>
        {chart}
    </Card>
}
const TotalPetitions = () => {
    const q = `select count(1) as count from 'db.parquet'`;
    const { data, error, isLoading } = useDbQuery<{ count: number }>(q);

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    const count = data && data[0]?.count

    return <Card >
        <Text>Sales</Text>
        <Metric>{count}</Metric>
    </Card>
}
export default function page() {
    return <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-2 m-8">
        <Col numColSpan={1}>
            <TotalPetitions />
        </Col>
        <Col numColSpan={1}>
            <TotalPetitions />
        </Col>
        <Col numColSpan={2}>
            <CountsByYear />
        </Col>
        <Col numColSpan={4}>
            <CompanyLineChart />
        </Col>
        <Col numColSpan={4}>
            <StateWiseChart />
        </Col>
    </Grid>
}