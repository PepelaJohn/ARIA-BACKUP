

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-orange-500">Dashboard</h2>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="py-2 px-6 hover:bg-orange-100 text-orange-600 font-medium">
              Dashboard
            </li>
            <li className="py-2 px-6 hover:bg-orange-100">Customers</li>
            <li className="py-2 px-6 hover:bg-orange-100">Orders</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Hello, Evano 👋</h1>
          <input
            type="text"
            placeholder="Search"
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </header>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-gray-600">Total Customers</h2>
            <p className="text-2xl font-bold text-orange-500">5,423</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-gray-600">Members</h2>
            <p className="text-2xl font-bold text-orange-500">1,893</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-gray-600">Active Now</h2>
            <p className="text-2xl font-bold text-orange-500">189</p>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-white shadow-md rounded-lg overflow-hidden">
          <header className="p-4 bg-orange-500 text-white font-medium">All Customers</header>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic rows */}
              <tr>
                <td className="p-4">Jane Cooper</td>
                <td className="p-4">jane@microsoft.com</td>
                <td className="p-4 text-green-500">Active</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
