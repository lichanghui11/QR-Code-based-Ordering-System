import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { Skeleton } from "antd";
import { useAtom } from "jotai";
import { isLoginAtom } from "../store/store";
import axios from "axios";
import { type User } from "../types/types.ts";
import { Tabs } from "antd";

// const Loading: React.FC = () => <Skeleton active />;
// console.log('登录状态： ', isLoginAtom)
export default function Test() {
  const [isLogin] = useAtom(isLoginAtom);
  const navigate = useNavigate();
  const [userinfo, setUserinfo] = useState<null | User>(null);
  const navigator = useNavigate();

  function logout() {
    axios.get("/api/logout").then((res) => {
      console.log("logout: ", res.data);
      navigator("/");
    });
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

  const location = useLocation();

  // 定义三个 tab 的数据
  const items = [
    { key: "orders", label: "订单管理" },
    { key: "foods", label: "菜品管理" },
    { key: "desks", label: "桌面管理" },
  ];

  // 根据当前路由路径设置 activeKey
  // 假设子路由路径为 "/orders", "/foods", "/desks"
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes("orders")) return "orders";
    if (path.includes("foods")) return "foods";
    if (path.includes("desks")) return "desks";
    // 默认返回第一个
    return items[0].key;
  };

  // 在 tab 切换时导航到对应的子路由
  const onChange = (activeKey: string) => {
    navigate(activeKey);
  };

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
          {/* 使用 Tabs 来切换不同的管理页面 */}
          <Tabs
            activeKey={getActiveKey()}
            items={items}
            onChange={onChange}
            centered
            className="bg-[#f9f9f9] rounded-t-2xl"
            // 使用 tabBarStyle 设置整个 Tabs 导航栏的高度和行高
            tabBarStyle={{
              height: "40px",
              lineHeight: "20px",
              backgroundColor: "#f9f9f9",
              marginBottom: '0',
            }}
          />
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
