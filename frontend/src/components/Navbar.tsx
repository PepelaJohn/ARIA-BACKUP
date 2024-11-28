import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoImage from "../assets/logolight.png";
import LogoImageDark from "../assets/logodark.png";
import { MdArrowDropDown } from "react-icons/md";
import { getDecryptedCookie } from "../utils";
import { MdLogin as LogInIcon } from "react-icons/md";
import { logoutUser, refreshToken } from "../api";
import { HoverCardDemo } from "./DropDown";
import Cookies from "js-cookie";
import Menu from "../assets/menu.png";
import { toast } from "react-toastify";
import { gsap } from "gsap";


const Nav = () => {
  const sideRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fadeRef.current) {
      if (open) {
        gsap.set(fadeRef.current, { display: "block" });
        gsap.to(fadeRef.current, {
          opacity: 0.6,
          duration: 1,
          ease: "elastic.inOut",
        });
      } else {
        gsap.to(fadeRef.current, {
          opacity: 0,
          duration: 1,
          ease: "elastic.inOut",
          onComplete: () => {
            gsap.set(fadeRef.current, { display: "none" });
          },
        });
      }
    }
    if (sideRef.current) {
      if (open) {
        gsap.set(sideRef.current, { display: "flex" });
        gsap.to(sideRef.current, {
          left: 0,
          duration: 1,
          ease: "circ.inOut",
        });
      } else {
        gsap.to(sideRef.current, {
          left: -400,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(sideRef.current, { display: "none" });
          },
        });
      }
    }
  }, [open]);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const user = getDecryptedCookie();

  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomepage = location.pathname === "/";
  const isDashBoard =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/corporate");

  useEffect(() => {
    if (!!(!!user && !!user._id)) refreshToken(user._id);
    refreshInterval.current = setInterval(() => {
      if (!!(!!user && !!user._id)) {
        refreshToken(user._id);
      }
    }, 60 * 1000);

    return () => {
      clearInterval(refreshInterval.current!);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      // console.log(window.screenY, window.scrollY, window.Screen.length)
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navbarClasses = `${
    isDashBoard ? "hidden " : "flex"
  } fixed flex-col top-0 left-0 right-0 justify-center  !z-50 h-[60px] text-white  items-center transition-all duration-300 ${
    !isHomepage || isScrolled ? "bg-primaryOrange" : "bg-transparent"
  }`;

  return (
    <div className="relative">
      <div
        ref={fadeRef}
        onClick={() => {
          if (open) {
            setOpen(false);
          }
        }}
        className="!z-[60] absolute hidden inset-0 h-screen p-8 bg-black "
      >
        <div className="flex flex-1 items-center   lg:hidden justify-end">
          <span
            className="cursor-pointer !z-[100] "
            onClick={() => setOpen((prev) => !prev)}
          >
            <img src={Menu} width={20} alt="" />
          </span>
        </div>
      </div>
      <div
        ref={sideRef}
        className="absolute flex  min-w-[400px] top-0 h-screen bottom-0 z-[100] bg-gray-100 -left-[500px] bg-repeat bg-center bg-[url('/src/assets/bgr.png')]"
      >
        <div className="flex  flex-col !text-black items-center w-full">
          <div className="w-full flex bg-black py-4 mb-8 items-center justify-center">
            <Link to={"/"} className="text-2xl  w-[90px] font-bold">
              <img src={LogoImage} className="w-full" alt="" />
            </Link>
          </div>

          <div className="flex flex-1  flex-col w-full p-4 lg:hidden items-center gap-4">
            <div className="flex flex-col item-center w-full gap-4">
              {!!user && (
                <>
                  <Link
                    className="hover:text-primaryOrange text-3xl w-full transitionEase"
                    to={"/ride"}
                  >
                    Ride
                  </Link>
                </>
              )}
              <Link
                className="hover:text-primaryOrange text-3xl w-full transitionEase"
                to={"/auth?role=service-provider&auth=sign-up"}
              >
                Drive
              </Link>
              {user?.role === "corporate" && (
                <Link
                  className="hover:text-primaryOrange text-3xl w-full transitionEase"
                  to={"/corporate/quote"}
                >
                  Corporate
                </Link>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-end mt-auto w-full text-3xl ">
              <span className="cursor-pointer   {w-8 h-8 replace} flex items-center ">
                {user ? (
                  <button
                    onClick={async () => {
                      const data = await logoutUser(user._id);
                      localStorage.clear();

                      if (data.status === 200) {
                        Cookies.remove("access_r", {
                          secure: true,
                          httpOnly: false,
                          expires: 30, //30 days
                        });
                        window.location.reload();
                      } else {
                        toast("Failed to logout.", { autoClose: 1000 });
                      }
                    }}
                    className="transitionEase text-3xl border-white px-3 hover:border-primaryOrange  py-1 hover:text-primaryOrange"
                  >
                    Logout
                    {/* <span className="rounded-full items-center flex flex-col justify-center h-8 w-8 cursor-pointer overflow-hidden bg-gray-200 relative">
                  <span className="h-4 w-4 rounded-full bg-gray-500"></span>
                  <span className="h-8 w-8 -mb-8 rounded-full bg-gray-500"></span>
                </span> */}
                  </button>
                ) : (
                  <Link to={"/auth?auth=sign-up"}>
                    <span className="mr-4">Login</span>
                    <LogInIcon></LogInIcon>
                  </Link>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={navbarClasses}>
        <header
          className={` ${
            !isHomepage || isScrolled ? "bg-black" : "bg-primaryOrange"
          } transitionEase w-full text-white h-[20px] items-center flex justify-center text-center text-xs`}
        >
          ARIA
        </header>
        <div className="flex h-[60px] max-w-[1700px] justify-between items-center px-8 w-full">
          <Link to={"/"} className="text-2xl w-[70px] font-bold">
            <img
              src={!isHomepage || isScrolled ? LogoImageDark : LogoImage}
              className="w-full"
              alt=""
            />
          </Link>

          <div className="flex max-lg:hidden items-center gap-4">
            {!!user && (
              <>
                <Link
                  className="hover:text-primaryOrange transitionEase"
                  to={"/ride"}
                >
                  Ride
                </Link>
              </>
            )}
            <Link
              className="hover:text-primaryOrange transitionEase"
              to={"/auth?role=service-provider&auth=sign-up"}
            >
              Drive
            </Link>
            <Link
              className="hover:text-primaryOrange transitionEase"
              to={"/corporate/auth"}
            >
              Business
            </Link>

            <HoverCardDemo>
              <span className="flex hover:text-primaryOrange transitionEase items-center cursor-pointer rounded-full px-3 py-2">
                What we offer
                <MdArrowDropDown className="ml-1 flex items-center"></MdArrowDropDown>
              </span>
            </HoverCardDemo>

            <div className="flex items-center w-[200px] text-lg space-x-4 ">
              <button className="text-lg">EN</button>
              <a href="#help">Help</a>
              <span className="text-xl cursor-pointer  mx-2 {w-8 h-8 replace} flex items-center justify-center">
                {user ? (
                  <button
                    onClick={async () => {
                      const data = await logoutUser(user._id);
                      localStorage.clear();

                      if (data.status === 200) {
                        Cookies.remove("access_r", {
                          secure: true,
                          httpOnly: false,
                          expires: 30, //30 days
                        });
                        window.location.reload();
                      } else {
                        toast("Failed to logout.", { autoClose: 1000 });
                      }
                    }}
                    className="text-sm transitionEase border border-white px-3 hover:border-primaryOrange  py-1 hover:text-primaryOrange"
                  >
                    Logout
                    {/* <span className="rounded-full items-center flex flex-col justify-center h-8 w-8 cursor-pointer overflow-hidden bg-gray-200 relative">
                  <span className="h-4 w-4 rounded-full bg-gray-500"></span>
                  <span className="h-8 w-8 -mb-8 rounded-full bg-gray-500"></span>
                </span> */}
                  </button>
                ) : (
                  <Link to={"/auth?auth=sign-up"}>
                    <LogInIcon></LogInIcon>
                  </Link>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-1 items-center   lg:hidden justify-end">
            <span
              className="cursor-pointer !z-[100] "
              onClick={() => setOpen((prev) => !prev)}
            >
              <img src={Menu} width={20} alt="" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
