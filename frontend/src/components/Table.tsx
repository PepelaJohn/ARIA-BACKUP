import { formatNumberWithCommas, getDecryptedCookie } from "../utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface IServiceOrder {
  _id: string;
  trackingId: string;
  consumerId: ConsumerId;
  serviceType: string;
  price: number;
  status: string;
  __v: number;
  serviceProviderId: ConsumerId;
}

interface ConsumerId {
  _id: string;
  name: string;
  email: string;
}

export default function TableDemo({ data }: { data: IServiceOrder[] }) {
  const user = getDecryptedCookie();
  const sumPrices = (items: IServiceOrder[]): number => {
    return items
      .map((item) => (item.status === "completed" ? item.price : 0)) // Get price or default to 0 if undefined
      .reduce((acc, curr) => Number(acc) + Number(curr), 0); // Sum up the prices
  };
  return (
    <Table className="bg-gray-50 overflow-auto">
      <TableCaption>A list of your recent shipments.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Tracking Id</TableHead>
          <TableHead>
            {!!user && user.role === "service-provider"
              ? "Customer Name"
              : "Provider Name"}
          </TableHead>
          <TableHead className="max-md:hidden">Email</TableHead>
          <TableHead className="max-md:hidden">Service Type</TableHead>
          <TableHead>Price</TableHead>

          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((invoice) => (
          <TableRow className={``} key={invoice._id}>
            <TableCell className="font-medium">{invoice.trackingId}</TableCell>
            <TableCell>
              {!!user && user.role === "service-provider"
                ? invoice?.consumerId?.name || "-"
                : invoice?.serviceProviderId?.name || "-"}
            </TableCell>
            <TableCell className="max-md:hidden">
              {!!user && user.role === "service-provider"
                ? invoice?.consumerId?.email || "-"
                : invoice?.serviceProviderId?.email || "-"}
            </TableCell>
            <TableCell className="max-md:hidden">
              {invoice.serviceType}
            </TableCell>

            <TableCell className="">
              KES {formatNumberWithCommas(invoice.price)}
            </TableCell>
            <TableCell
              className={`text-right  ${
                invoice.status === "in-progress" || invoice.status === "pending"
                  ? "text-primaryOrange"
                  : invoice.status === "completed"
                  ? "text-green-500"
                  : invoice.status === "cancelled"
                  ? "text-red-500"
                  : "text-primaryBlue"
              }`}
            >
              {invoice.status}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {!!user && user.role === "service-provider" && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Income</TableCell>
            <TableCell className="text-right">
              KES {formatNumberWithCommas(sumPrices(data))}
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
