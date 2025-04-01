import { Suspense, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Skeleton } from "antd";
import { useAtom } from 'jotai'
import { isLoginAtom } from "../store/store";

const Loading: React.FC = () => <Skeleton active />;

export default function HomeView() {
const [isLogin]= useAtom(isLoginAtom)
const navigate = useNavigate()

  useEffect(() => {
    if (isLogin === false) {
      navigate('/')
    }
}, [isLogin, navigate])

  if (isLogin === false) {
  return null
}

  return (
    <>
      <div className="flex flex-col bg-[#fae158] ">
        <div
          data-class="餐厅名称"
          className="relative h-12 text-2xl flex justify-center items-center font-bold flex-none"
        >
          大食堂
          <button className="absolute right-[5px] font-normal text-[20px] bg-white rounded-[10px] px-[10px] py-[2px]">退出</button>
        </div>
        <div className="flex flex-1 bg-[#f9f9f9] rounded-[20px]">
          <div className="flex-1">
            <div className="flex justify-around">
              <Link
                className="my-[5px] h-[40px] flex bg-white items-center border rounded border-[#f9f9f9] px-[20px] font-bold"
                to="orders"
              >
                订单管理
              </Link>
              <Link
                className="my-[5px] h-[40px] flex bg-white items-center border rounded border-[#f9f9f9] px-[20px] font-bold"
                to="foods"
              >
                菜品管理
              </Link>
              <Link
                className="my-[5px] h-[40px] flex bg-white items-center border rounded border-[#f9f9f9] px-[20px] font-bold"
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
