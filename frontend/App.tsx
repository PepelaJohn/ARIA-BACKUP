import { Route, BrowserRouter, Routes } from "react-router-dom";

// import Home2 from "./paths/Home";
import AuthForm from "./paths/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Nav from "./components/Navbar";
import TripPage from "./paths/Trip";
import RatingPage from "./paths/RatingPage";
import CorporateQuote from "./paths/CorporateQuote";
import ProtectedRoute from "./components/ProtectedRoute";

import Ride from "./paths/Ride";
import CorporateAuth from "./components/Corporate/CorporateAuth";
import DashboardPage from "./paths/Dashboard";
import AuthenticatedRoute from "./components/Authenticated";
import GuestRoute from "./components/GuestRoute";
import Home from "./paths/Home2";
import PendingQuotesPage from "./paths/Corporate/PendingQuotesPage";
import QuoteDetailsPage from "./paths/Corporate/QuoteDetailsPage";
import EditQuotePage from "./paths/Corporate/editQuote";

import ImageUpload from "./paths/Image";
import Verify from "./paths/Verify";
// import OrderDetails from "./paths/Order";

function App() {
  return (
    <div className="w-full bg-[url('/src/assets/bgr.png')]  bg-gray-100 bg-repeat ">
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <BrowserRouter future={{ v7_startTransition: true }}>
        <Nav />
        <Routes>

          <Route path="/upload" element={<ImageUpload />} />
          <Route path="/verify/:userId" element={<Verify />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/pending" element={<PendingQuotesPage />} />
          <Route path="/quotes/:id" element={<QuoteDetailsPage />} />
          <Route path="/quotes/edit/:id" element={<EditQuotePage />} />
          <Route
            path="/corporate/auth"
            element={
              <GuestRoute>
                <CorporateAuth />
              </GuestRoute>
            }
          />

          <Route
            path="/auth"
            element={
              <GuestRoute>
                <AuthForm />
              </GuestRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <ProtectedRoute
                  allowedRoles={["corporate", "consumer", "service-provider"]}
                >
                  <DashboardPage />
                </ProtectedRoute>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/ride"
            element={
              <AuthenticatedRoute>
                <ProtectedRoute allowedRoles={["corporate", "consumer"]}>
                  <Ride />
                </ProtectedRoute>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/trip/:orderId"
            element={
              <AuthenticatedRoute>
                <TripPage />
              </AuthenticatedRoute>
            }
          />

          <Route
            path="/trip/rating/:orderId"
            element={
              <AuthenticatedRoute>
                <RatingPage />
                {/* <RatingReviewModal/> */}
              </AuthenticatedRoute>
            }
          />

          {/* <Route path="/corporate/quote" element={<CorporateQuote />} /> */}

          {/* Protected Route for Corporate User */}
          <Route
            path="/corporate/quote"
            element={
              <ProtectedRoute allowedRoles={["corporate"]}>
                <CorporateQuote />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
