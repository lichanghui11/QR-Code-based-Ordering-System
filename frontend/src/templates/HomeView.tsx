import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
// import { Skeleton } from "antd";
import { useAtom } from "jotai";
import { isLoginAtom } from "../store/store";
import axios from "axios";
import { type User } from "../types/types.ts";

// const Loading: React.FC = () => <Skeleton active />;
// console.log('登录状态： ', isLoginAtom)
export default function Test() {
  const [isLogin] = useAtom(isLoginAtom);
  const navigate = useNavigate();
  const [userinfo, setUserinfo] = useState<null | User>(null);
  const [selectedTab, setSelectedTab] = useState<string>("orders");
  const navigator = useNavigate();

  function logout() {
    axios.get("/api/logout").then((res) => {
      console.log("logout: ", res.data);
      navigator("/");
    });
  }

  const getTabClass = (tabName: string) => {
    if (tabName === selectedTab) {
      return "my-[5px] h-[40px] flex bg-[#fae158] items-center border rounded border-[#f9f9f9] px-[20px] font-bold";
    } else {
      return "my-[5px] h-[40px] flex bg-white items-center border rounded border-[#f9f9f9] px-[20px] font-bold";
    }
  };

  useEffect(() => {
    axios.get("/api/userinfo").then((res) => {
      console.log(res.data);
      setUserinfo(res.data);
    });
  }, []);

  useEffect(() => {
    if (isLogin === false) {
      navigate("/");
    }
  }, [isLogin, navigate]);

  if (isLogin === false) {
    //组件函数原则上应该是一个纯函数，不应该返回任何东西
    return null;
  }

  return (
    <div>
      <div className="fixed w-full z-50">
        <div className="bg-[#fae158]">
          <div className=" bg-[#fae158] h-12 text-2xl font-bold flex items-center justify-center relative">
            <span className="">{userinfo?.title}</span>
            <button
              onClick={() => logout()}
              className="cursor-pointer absolute right-[15px] font-normal bg-white px-[10px] py-[2px] text-[18px] rounded-[10px]"
            >
              退出
            </button>
          </div>
          <div className="flex justify-around items-center bg-[#f9f9f9] rounded-t-2xl">
            <Link
              to="orders"
              onClick={() => {
                setSelectedTab("orders");
              }}
              className={getTabClass("orders")}
            >
              订单管理
            </Link>
            <Link
              to="foods"
              onClick={() => {
                setSelectedTab("foods");
              }}
              className={getTabClass("foods")}
            >
              菜品管理
            </Link>
            <Link
              to="desks"
              onClick={() => {
                setSelectedTab("desks");
              }}
              className={getTabClass("desks")}
            >
              桌面管理
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-[100px] bg-[#f9f9f9]">
        <Suspense fallback={"Loading..."}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
