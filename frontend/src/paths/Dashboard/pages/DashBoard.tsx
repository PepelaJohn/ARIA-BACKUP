import { useState, useEffect } from "react";
import axios from "axios";
import { getPendingQuotes } from "../../../api";

const Dashboard = () => {
  const [dashboardData, _] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // const statsResponse = await axios.get("/api/dashboard-stats"); // Replace with your endpoint
        // setDashboardData(statsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    const fetchQuotes = async () => {
      try {
        const quotesResponse  = await getPendingQuotes();
        setQuotes(quotesResponse.data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const ordersResponse = await axios.get("/api/orders");
        setOrders(ordersResponse.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchDashboardData();
    fetchQuotes();
    fetchOrders();
  }, []);

//   if (!dashboardData) return <p>Loading...</p>;             

  return (
    <div className="flex  h-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/5 bg-white p-4 shadow-md">
        {/* ... Sidebar content remains unchanged ... */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hello 👋</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Display stats from API */}
          {[
            { title: "Total Customers", value: dashboardData.totalCustomers, icon: "👥", change: "+11% this month" },
            { title: "Quotes Requested", value: quotes.length, icon: "📜", change: "+5% this month" },
            { title: "Orders", value: orders.length, icon: "🛒", change: "+8% this month" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-600">{stat.title}</p>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
                <p className="text-green-500 text-sm">{stat.change}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          ))}
        </section>

        {/* Quotes Section */}
        <section className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Recent Quotes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-b">
                    <td className="py-2 px-4">{quote.id}</td>
                    <td className="py-2 px-4">{quote.description}</td>
                    <td className="py-2 px-4">{quote.date}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 text-sm rounded-lg ${
                          quote.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders Section */}
        <section className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Service</th>
                  <th className="py-2 px-4">Pickup</th>
                  <th className="py-2 px-4">Destination</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-4">{order.id}</td>
                    <td className="py-2 px-4">{order.service}</td>
                    <td className="py-2 px-4">{order.pickup}</td>
                    <td className="py-2 px-4">{order.destination}</td>
                    <td className="py-2 px-4">{order.date}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 text-sm rounded-lg ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
