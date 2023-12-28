'use client';
import { Card, Text, Metric, BarChart, Title, Flex, Bold } from "@tremor/react";
import { useDbQuery } from '../lib/db';
import { BaseParam } from "./common";
import dayjs from "dayjs";
import { useMemo } from "react";
export const TotalPetitions = ({ range }: BaseParam) => {
    const q = `
    WITH gp1 as (
        SELECT *, date_trunc('month', RECEIVED_DATE) as bucket 
        FROM 'db.parquet'
        WHERE RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
    )

    select strftime(gp1.bucket , '%b %Y') as dt, histogram(CASE_STATUS) as histogram from gp1 
    group by bucket

    --select count(1) as count from 'db.parquet'
    --           WHERE CASE_STATUS = 'Certified'
    --          AND RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
    `;
    const { data, error, isLoading } = useDbQuery<{ dt: string; histogram: any }>(q);

    // if (error) return <div>failed to load</div>;
    // if (isLoading) return <div>loading...</div>;

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
        <Title>Total petition counts</Title>
        <Flex className="mt-4">
            <Text>Partitions</Text>
        </Flex>
        <BarChart
            className="mt-4 h-64"
            data={finalData}
            index="dt"
            categories={uniqueAttributes}
            colors={["sky", "violet", "fuchsia", "green"]}
            showAnimation={true}
            stack={false}
        /></Card>
};
