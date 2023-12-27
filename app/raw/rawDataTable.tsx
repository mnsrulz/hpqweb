import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";

export const RawDataTable = ({ data }: { data: any[] }) => {
    if (!data || data.length <= 0) {
        return <span>no data...</span>
    }

    return <Table className="mt-5 text-sm" >
        <TableHead>
            <TableRow>
                {
                    Object.keys(data[0]).map(h => (<TableHeaderCell>{h}</TableHeaderCell>))
                }
            </TableRow>
        </TableHead>
        <TableBody>
            {data.map((item) => (
                <TableRow key={item}>
                    {Object.keys(item).map(h => (<TableCell>{item[h]}</TableCell>))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
}