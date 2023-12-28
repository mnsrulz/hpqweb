'use client';
import { Card, Text, BarList, Bold, Flex, Title } from "@tremor/react";
import { useDbQuery } from '../lib/db';
import { BaseParam } from "./common";
import dayjs from "dayjs";

export const CompanyTotalPetitions = ({range}: BaseParam) => {
    const q = `select EMPLOYER_NAME as name, count(1) as value from 'db.parquet' 
                WHERE RECEIVED_DATE BETWEEN '${dayjs(range.from).format('YYYY-MM-DD')}' AND '${dayjs(range.to).format('YYYY-MM-DD')}'
                GROUP BY name 
                ORDER BY value desc
                LIMIT 5`;
    const { data, error, isLoading } = useDbQuery<{ name: string; value: number; }>(q);

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
        <BarList data={data || []} className="mt-4 h-64" 
        showAnimation={true}
        />
    </Card>;
};
