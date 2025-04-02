import axios from "axios";
import { useEffect, useState } from "react";
import { userAtom } from "../store/store.tsx";
import { useAtomValue } from "jotai";
import { type Order } from "../types/types.ts";
import PrintButton from "../utils/PrintButton.tsx";
import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";

function formatISOToLocal(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

class EachOrders {
  orders: Order[] = [];
  constructor() {
    makeAutoObservable(this);
  }
  deleteOrder(idx: number) {
    this.orders.splice(idx, 1);
  }
  changeOrderStatus(idx: number, status: Order["status"]) {
    this.orders[idx].status = status;
  }
  addOrders(...orders: Order[]) {
    this.orders.push(...orders);
  }
}

// 示例使用// 注意：输出的时间根据本地时区而定
const Orders = observer(() => {
  const [ordersManager] = useState(() => observable(new EachOrders()));
  const user = useAtomValue(userAtom);
  // console.log('user in the store: ',user)

  //刷新页面后，atom里面的user信息就会丢失，
  //一个方法是将数据存到localStorage
  //另一个方法是使用的时候，重新向服务器请求
  //要么就不使用刷新
  let ignore = false;
  useEffect(() => {
    console.log("运行了几次： ", ignore);
    if (!ignore) {
      axios.get(`/api/restaurant/1/order`).then((res) => {
        // console.log('订单',  (res.data))
        ordersManager.addOrders(...res.data);
      });
    }
    return () => {
      ignore = true;
    };
  }, []);

  async function deleteOrder(id: number, idx: number) {
    await axios.delete("/api/reataurant/1/order/" + id);
    ordersManager.deleteOrder(idx);
  }

  async function confirmOrder(id: number, idx: number) {
    await axios.put("/api/restaurant/1/order" + id + "/status", {
      status: "confirmed",
    });
    ordersManager.changeOrderStatus(idx, "confirmed");
  }

  async function completeOrder(id: number, idx: number) {
    await axios.put("/api/restaurant/1/order" + id + "/status", {
      status: "completed",
    });
    ordersManager.changeOrderStatus(idx, "completed");
  }

  return (
    <>
      <ul className="px-4 bg-[#f9f9f9]">
        {ordersManager.orders.map((order, idx) => {
          return (
            <>
              <li key={order.id} className="p-2 rounded mb-4 bg-white  pt-1 ">
                <div className="flex flex-col">
                  <div className="flex mb-2 h-[200px]">

                    <div className="flex flex-col justify-between text-[#555]">
                      <div>ID： {order.did}</div>
                      <div>座位号： {order.deskName}</div>
                      <div>
                        消费总额：{" "}
                        <span className="text-[#e14f63] text-[12px]">¥</span>
                        <span className="text-[#e14f63]">
                          {order.totalPrice}
                        </span>
                      </div>
                      <div>用餐人数： {order.customCount}</div>
                      <div>订单状态： <span className="bg-[#aaf4a3] px-[8px] py-[4px] rounded">{order.status === 'pending' ? '待确认订单' : order.status === 'confirmed' ? '已确认订单' : order.status === 'completed' ? '已付款' : ''}</span></div>
                      <div> 下单时间： {formatISOToLocal(order.timestamp)}</div>
                    </div>

                    <div className="ml-auto flex flex-col gap-4 font-bold">
                      <PrintButton data={order} />

                      {order.status === "pending" && (
                        <button
                          onClick={() => confirmOrder(order.id, idx)}
                          className="cursor-pointer px-4 py-2 rounded-[20px] bg-[#fae158]"
                        >
                          确认
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => completeOrder(order.id, idx)}
                          className="cursor-pointer px-4 py-2 rounded-[20px] bg-[#fae158]"
                        >
                          完成
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id, idx)}
                        className="cursor-pointer px-4 py-2 rounded-[20px] bg-[#fae158]"
                      >
                        删除
                      </button>
                    </div>

                  </div>

                  <ul className="bg-[#fdf4e4] text-[#9f745b] rounded">
                    {order.details.map((detail, idx) => {
                      return (
                        <li key={order.id} className="p-2 mb-2">
                          <div>
                            菜名：{" "}
                            <span className="text-[#6f3713] font-bold text-[18px]">
                              {detail.food.name}
                            </span>
                          </div>
                          <div>数量： {detail.amount}</div>
                          <div>
                            价格：{" "}
                            <span className="text-[#e14f63] text-[12px]">
                              ¥
                            </span>
                            <span className="text-[#e14f63]">
                              {detail.food.price}
                            </span>{" "}
                            ✖️ {detail.amount}份
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            </>
          );
        })}
      </ul>
    </>
  );
});

export default Orders;
