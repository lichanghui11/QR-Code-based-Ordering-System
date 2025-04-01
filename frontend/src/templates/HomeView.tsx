import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Skeleton } from "antd";
import { useAtom } from "jotai";
import { isLoginAtom } from "../store/store";
import axios from "axios";
import { type User } from "../types/types.ts";

const Loading: React.FC = () => <Skeleton active />;
// console.log('登录状态： ', isLoginAtom)
export default function HomeView() {
  const [isLogin] = useAtom(isLoginAtom);
  const navigate = useNavigate();
  const [userinfo, setUserinfo] = useState<null | User>(null);
  const [selectedTab, setSelectedTab] = useState<string>('orders')

  const getTabClass = (tabName: string) => {
    if (tabName === selectedTab) {
      return 'my-[5px] h-[40px] flex bg-[#fae158] items-center border rounded border-[#f9f9f9] px-[20px] font-bold'
    } else {
      return 'my-[5px] h-[40px] flex bg-white items-center border rounded border-[#f9f9f9] px-[20px] font-bold'
    }
  }

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
    <>
      <div className="flex flex-col bg-[#fae158] ">
        <div
          data-class="餐厅名称"
          className="relative h-12 text-2xl flex justify-center items-center font-bold flex-none"
        >
          {userinfo?.title}
          <button className="absolute right-[15px] font-normal text-[20px] bg-white rounded-[10px] px-[10px] py-[2px]">
            退出
          </button>
        </div>
        <div className="flex flex-1 bg-[#f9f9f9] rounded-[20px]">
          <div className="flex-1">
            <div className="flex justify-around">
              <Link
                onClick={() => {setSelectedTab('orders')}}
                className={getTabClass('orders')}
                to="orders"
              >
                订单管理
              </Link>
              <Link
                onClick={() => {setSelectedTab('foods')}}
                className={getTabClass('foods')}
                to="foods"
              >
                菜品管理
              </Link>
              <Link
                onClick={() => {setSelectedTab('desks')}}
                className={getTabClass('desks')}
                to="desks"
              >
                桌面管理
              </Link>
            </div>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
