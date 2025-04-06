import { Link } from "react-router";



export default function OrderSuccessPage() {



  return (
    <>
      <div className=" bg-[url('/background.jpg')] bg-cover bg-no-repeat h-[100vh] flex ">
        <div className="w-full m-auto bg-white opacity-90 p-4 rounded justify-self-start">
          <div className="text-center my-4 bg-[#fae158] rounded py-2 ">
            您已点餐成功，后厨正在准备您的餐品
            <h1>此页面可以直接关闭</h1>
            <h1>
              或者点击
              <span className="cursor-pointer px-2 py-1 border-b border-px shasow text-[#0000ee] " style={{ backgroundColor: 'white', }}>
                <Link to="/r/:restaurantId/d/:deskId">菜单详情</Link>
              </span>
              浏览其他菜品
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}