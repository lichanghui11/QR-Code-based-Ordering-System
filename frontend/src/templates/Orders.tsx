import axios from 'axios'
import { useEffect } from 'react'
import {useImmer} from 'use-immer'
import { userAtom } from '../store/store.tsx'
import { useAtomValue } from 'jotai'
import { type Order } from '../types/types.ts'
function formatISOToLocal(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 示例使用
const isoTime = "2025-04-01T12:34:56.789Z";
console.log(formatISOToLocal(isoTime));
// 输出格式类似： "2025-04-01 20:34:56"
// 注意：输出的时间根据本地时区而定
export default function Orders() {
const [orders, updateOrders] = useImmer<Order[]>([])
const user = useAtomValue(userAtom)
console.log('user in the store: ',user)
  
  //刷新页面后，atom里面的user信息就会丢失，
  //一个方法是将数据存到localStorage
  //另一个方法是使用的时候，重新向服务器请求
  //要么就不使用刷新

  useEffect(() => {
    axios.get(`/api/restaurant/1/order`).then(res => {

      console.log('订单',  (res.data))
      updateOrders((orders) => {
        orders.push(...res.data)
      })
    })
  }, [])  

  async function deleteOrder(id: number, idx: number) {
    await axios.delete('/api/reataurant/1/order/' + id)
    updateOrders(orders => {
      orders.splice(idx, 1)
    })
  }

  return (
    <>
        <ul className='px-4 bg-[#f9f9f9]'>
          {
            orders.map((order, idx) => {
              console.log(order.id)
              return (
                <>
                <li key={order.id} className='flex  rounded mb-4 bg-white border-b-2 border-[#fae158]'>
                  <div className='flex flex-col justify-around'>
                    <div>餐桌号： {order.did}</div>
                    <div>消费总额： {order.totalPrice}</div>
                    <div>用餐人数： {order.customCount}</div>
                    <div>订单状态： {order.status}</div>
                    <div> 下单时间： {formatISOToLocal(order.timestamp)}</div>
                      <ul>
                        {
                          order.details.map((detail, idx) => {
                            return (
                              <li key={Math.random()}>
                                <div>菜名： {detail.food.name}</div>
                                <div>数量： {detail.amount}</div>
                                <div>价格： ¥{detail.food.price} ✖️ {detail.amount}份</div>
                              </li>
                            )
                          })
                        }
                    </ul>
                  </div>
                  <div className='ml-auto flex flex-col justify-around '>
                    <button className=' px-4 py-2 rounded bg-[#fae158]'>打印</button>
                    <button className=' px-4 py-2 rounded bg-[#fae158]'>确认</button>
                    <button className=' px-4 py-2 rounded bg-[#fae158]'>完成</button>
                    <button onClick={() => deleteOrder(order.id, idx)} className=' px-4 py-2 rounded bg-[#fae158]'>删除</button>
                  </div>
                </li>
                </>
              )
            })
          }
        </ul>
    </>
  )
}