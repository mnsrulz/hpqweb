import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";
const isObject = (item: any) =>
    (typeof item === "object" && !Array.isArray(item) && item !== null);

export const RawDataTable = ({ data }: { data: any[] }) => {
    if (!data || data.length <= 0) {
        return <span>no data...</span>
    }

    return <Table className="mt-5 text-sm" >
        <TableHead>
            <TableRow>
                {
                    Object.keys(data[0]).map(h => (<TableHeaderCell key={h}>{h}</TableHeaderCell>))
                }
            </TableRow>
        </TableHead>
        <TableBody>
            {data.map((item, ix) => (
                <TableRow key={ix}>
                    {Object.keys(item).map(h => (<TableCell key={h}>{isObject(item[h]) ? JSON.stringify(item[h]): item[h]}</TableCell>))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
}