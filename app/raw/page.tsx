'use client'
import {
    Button, Card, Textarea, Divider,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from "@tremor/react";
import { useState } from "react";
import { query } from '../lib/db'
import { RawDataTable } from "./rawDataTable";
const defaultQuery = `SELECT * FROM 'db.parquet'
LIMIT 10`;

const RawTab = () => {
    const [value, setValue] = useState(defaultQuery);
    const [data, setData] = useState([] as any[]);
    const onSubmitQuery = async (e: any) => {
        e.preventDefault();
        const result = await query(value);
        setData(result)
    }
    return <Card>
        <form onSubmit={onSubmitQuery}>
            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-sm text-slate-500">
                    Raw Query
                </label>
                <Textarea
                    rows={4}
                    onChange={(e) => setValue(e.target.value)}
                    id="description"
                    placeholder="Start typing here..."
                    value={value}
                />
            </div>
            <Button className="mt-2" variant="light" type="submit">
                Execute
            </Button>
        </form>
        <Divider />
        <RawDataTable data={data}></RawDataTable>
    </Card>
}

export default function Raw() {
    const [counter, setCounter] = useState(0);
    const [tabs, setTabs] = useState(['tab1'])
    const onTabAdd = () => {
        //tabs.push(`Tab-${counter + 1}`);
        setTabs([...tabs, `Tab-${counter + 1}`]);
        setCounter(counter + 1);
    }
    return <div className="pl-4 pr-4">
        <TabGroup >
            <TabList>
                {tabs.map(j => (<Tab key={j}>{j}</Tab>))}
                <Button variant="light" onClick={onTabAdd}>+</Button>
            </TabList>
            <TabPanels>
                {tabs.map(j => (<TabPanel key={j}>
                    <RawTab />
                </TabPanel>))}
            </TabPanels>
        </TabGroup>
    </div>
}