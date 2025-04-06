import { Link } from "react-router"


export default function HomeView() {


  return (
    <div className="rounded-2xl mx-4 mt-[20vh] bg-[#fae158] text-center py-[50px]">
        <div>
          我是商家？ 去
          <Link className="border-b cursor-pointer " to="/login">登录</Link>
        </div>
        <div>
          想成为商家？ 去
        <Link className="border-b cursor-pointer " to="/register">注册</Link>
      </div>
    </div>
  )
}
