// import { getDecryptedCookie } from "../utils";
import Dashboard from "../components/Dashboard";
import { Menu } from "lucide-react";
import LogoDark from "../assets/logodark.png";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  // const user = getDecryptedCookie()
  return (
    <div className=" bg-[url('/src/assets/bgr.png')]  min-h-full items-center bg-gray-100 bg-repeat bg-fixed h-full overflow-hidden relative flex flex-col ">
      <div className="w-full h-[100px] z-40 fixed top-0 left-0 right-0 bg-primaryOrange p-6 font-semibold flex items-center justify-center text-3xl">
        <div className="max-w-screen-xl w-full  p-6 flex items-center justify-between">
        <Link to="/">
          <img src={LogoDark} width={100} alt="" />
        </Link>
        <span className="cursor-pointer ">
          <Menu className="text-lg"></Menu>
        </span>
        </div>
      </div>

      <main className="w-full  h-full">
        <Dashboard></Dashboard>
      </main>
    </div>
  );
};

export default DashboardPage;
