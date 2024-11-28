"use client";
import { verifyEmail } from "../api";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";

const Verify = () => {
 
  const navigate = useNavigate();
  const params = useParams()
  console.log(params.userId);
  const userId = params.userId;
  //   console.log(params.userId);

  const [successVerify, setSuccessVerify] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      // console.log(searchParam);
      if (userId) {
        // alert();
        const dt = await verifyEmail(userId);
        if (dt.status === 200) {
          setSuccessVerify(true);
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      }
    };

    verifyUser();
  }, []);
  return (
    <section className="w-full h-full nav-h flex items-center justify-center flex-col text-black ">
      {!!successVerify && successVerify !== null && (
        <div className="  flex items-center justify-center flex-col">
          <p>
            You have successfully been verified, you will shortly be redirected.
            If you are not redirected within a few seconds please{" "}
            <Link to={"/"} className="text-primaryBlue ml-3">
              {" "}
              click here.
            </Link>
          </p>
        </div>
      )}
    </section>
  );
};

export default Verify;
