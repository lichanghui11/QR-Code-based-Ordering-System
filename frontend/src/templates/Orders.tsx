import axios from "axios";
import { useEffect, useState, useRef, useMemo } from "react";
import { userAtom } from "../store/store.tsx";
import { useAtomValue } from "jotai";
import { type Order } from "../types/types.ts";
import PrintButton from "../utils/PrintButton.tsx";
import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { io } from 'socket.io-client'
import { configure } from 'mobx'
configure({
  enforceActions: 'never'
})
import { notification } from 'antd'
import React from "react";




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


const Context = React.createContext({name: 'Default'})
const Orders = observer(() => {
  const [ordersManager] = useState(() => observable(new EachOrders()));
  const user = useAtomValue(userAtom);
  console.log("user in the store: ", user);
  const [api, contextHolder] = notification.useNotification()

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const handleEnableAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioEnabled(true);
        })
        .catch((err) => console.error("初始化音频失败:", err));
    }
  }


  useEffect(() => {
    const client = io(`ws://192.168.3.11:5173`, {
      path: "/restaurant",
      transports: ["websocket", "polling"],
      query: {
        restaurant: "restaurant:1", //要监听的餐厅id
      },
    });

    client.on("new order", (newOrder) => {
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch((err) =>
          console.error("音频播放失败:", err)
        );
      }

      setTimeout(() => {
        api.info({
          message: '有新的订单！',
          duration: null,
          description: <Context.Consumer>{() => null}</Context.Consumer>,
          style: {
            // paddingLeft: '10px',
            // paddingRight: '10px',
            // paddingTop: '5px', 
            // paddingBottom: '5px', 
          }
        })
      }, 100)


      ordersManager.orders.unshift(newOrder);
      console.log("now order................", newOrder);
    });

    return () => {
      client.close();
    };
  }, [audioEnabled]);

  async function deleteOrder(id: number, idx: number) {
    await axios.delete("/api/restaurant/1/order/" + id);
    ordersManager.deleteOrder(idx);
  }

  async function confirmOrder(id: number, idx: number) {
    await axios.put("/api/restaurant/1/order/" + id + "/status", {
      status: "confirmed",
    });
    ordersManager.changeOrderStatus(idx, "confirmed");
  }

  async function completeOrder(id: number, idx: number) {
    await axios.put("/api/restaurant/1/order/" + id + "/status", {
      status: "completed",
    });
    ordersManager.changeOrderStatus(idx, "completed");
  }

  const contextValue = useMemo(()  => ({ name: 'aaa'}), [])

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <ul className="relative px-4 bg-[#f9f9f9]">
        <audio src="/new-order-sound.mp3" ref={audioRef}></audio>
        {!audioEnabled && (
          <button className="real-button fixed top-[10px] z-[51]" onClick={handleEnableAudio}>启用提示音</button>
        )}
        {ordersManager.orders.map((order, idx) => {
          return (
            <>
              <li key={order.id} className="p-2 rounded mb-4 bg-white  pt-1 ">
                <div className="flex flex-col">
                  <div className="flex mb-2 h-[200px]">
                    <div className="flex flex-col justify-between text-[#555]">
                      <div>ID： {order.id}</div>
                      <div>桌号： {order.deskName}</div>
                      <div>
                        消费总额：{" "}
                        <span className="text-[#e14f63] text-[12px]">¥</span>
                        <span className="text-[#e14f63]">
                          {order.totalPrice}
                        </span>
                      </div>
                      <div>用餐人数： {order.customCount}</div>
                      <div>
                        订单状态：{" "}
                        <span className="bg-[#aaf4a3] px-[8px] py-[4px] rounded">
                          {order.status === "pending"
                            ? "待确认订单"
                            : order.status === "confirmed"
                            ? "已确认订单"
                            : order.status === "completed"
                            ? "已付款"
                            : ""}
                        </span>
                      </div>
                      <div> 下单时间： {formatISOToLocal(order.timestamp)}</div>
                    </div>

                    <div className="ml-auto flex flex-col gap-4 font-bold">
                      <PrintButton data={order} />

                      {order.status === "pending" && (
                        <button
                          onClick={() => confirmOrder(order.id, idx)}
                          className="cursor-pointer px-4 py-2 bg-[#fae158] hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
                        >
                          确认
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => completeOrder(order.id, idx)}
                          className="cursor-pointer px-4 py-2 bg-[#fae158] hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
                        >
                          完成
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id, idx)}
                        className="cursor-pointer px-4 py-2 bg-[#fae158] hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <ul className="bg-[#fdf4e4] text-[#9f745b] rounded">
                    {order.details.map((detail) => {
                      return (
                        <li key={Math.random()} className="p-2 mb-2">
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
    </Context.Provider>
  );
});

export default Orders;
