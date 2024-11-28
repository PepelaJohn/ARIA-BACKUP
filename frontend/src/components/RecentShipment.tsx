
import Table from "../components/Table";

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
const RecentShipment = ({data}:{data:IServiceOrder[]}) => {
  

 

  return (
    <div className="w-full p-6 max-w-screen-xl">
      <h2 className="text-lg font-semibold mb-4">Recent Shipment</h2>
      <Table data={data}></Table>
      {/* <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-200 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2">Tracking</th>
            <th className="text-left px-4 py-2">Customer Name</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Service Type</th>
            <th className="text-left px-4 py-2">Price</th>
            <th className="text-left px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((shipment, index) => (
            <tr
              key={index}
              className="border-t hover:bg-gray-100 transition-all"
            >
              <td className="px-4 uppercase py-2">{shipment.trackingId}</td>
              <td className="px-4 capitalize py-2">
                {shipment.consumerId.name}
              </td>
              <td className="px-4 py-2">{shipment.consumerId.email}</td>
              <td className="px-4 uppercase py-2">{shipment.serviceType}</td>
              <td className="px-4 py-2">KES {formatNumberWithCommas(shipment.price)}</td>
              <td
                className={`px-4 py-2 ${
                  shipment.status === "in-progress" ||
                  shipment.status === "pending"
                    ? "text-primaryOrange"
                    : shipment.status === "completed"
                    ? "text-green-500"
                    : shipment.status === "cancelled"
                    ? "text-red-500"
                    : "text-primaryBlue"
                }`}
              >
                {shipment.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};

export default RecentShipment;
