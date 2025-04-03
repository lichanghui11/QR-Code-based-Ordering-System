import { useRequest} from "ahooks"
import axios from "axios"
import { useParams } from "react-router"
import { useAtom } from 'jotai'
import { userAtom } from '../store/store.tsx'
import { Skeleton } from "antd"
import { type Food } from '../types/types.ts'
import { useEffect, useState } from "react"
import { useImmer } from 'use-immer'
import clsx from 'clsx'


function getMenu(restaurantId: number | string) {
  return axios.get('/api/menu/restaurant/' + restaurantId).then(res => {
    return res.data
  })
}

export default function OrderingPage() {
  const params = useParams()
  const [user] = useAtom(userAtom)
  const [, updateFoodCount] = useImmer<number[]>([])
  //foodCount是一个菜单长度的数组，记录客人对每个菜点了多少份

  const { data, loading } = useRequest(getMenu, {
    defaultParams: [params.restaurantId!],
    onSuccess: (data) => {
      updateFoodCount((foodCount) => {
        foodCount.push(...Array(data.length).fill(0))
       })
    }
  })

  console.log('the info of the menu: ', data)

  const refreshFoodCount = (current: number, idx: number) => {
    updateFoodCount(foodCount => {
      foodCount[idx] = current
    }) 
  }

  if (loading) {
    return <Skeleton />
  }

  return (
    <>
      <div className="bg-[#524d4d] h-full pt-4">
        <div className="bg-red-300 mx-4 rounded ">
          <div>{user.title}</div>
          <div>欢迎您的光临</div>
          <div>有折扣哦</div>
        </div>

        <div className="p-4 rounded bg-white">
          {
            data.map((food: Food, idx: number) => (
              <div key={food.id} className="mb-10 border">

                <div className="flex justify-between">

                  <img className="w-30 rounded " src={`/upload/${food.img}`} />
                  <div className="ml-2">
                    <div><span className="font-bold text-[20px] text-[#6f3713]">{food.name}</span> </div>
                    <div><span className="text-[#9e9e9e]">{food.desc}</span> </div>
                    <div className="flex gap-4">
                      <span className="text-[12px] text-[#e14f63] flex items-end">¥<span className="text-[#e14f63] flex items-end text-[18px] ">{food.price}</span></span>
                      <Counter min={0} max={10} start={0} step={1} onChange={(c) => refreshFoodCount(c, idx)}/> 
                    </div>
                  </div>

                </div>

              </div>
            ))
          }
                <button>下单</button>
        </div>

      </div>
    </>
  );
}

type CounterProp = {
  min: number, 
  max: number, 
  start: number, 
  step: number, 
  onChange: (current: number) => void
}
const Counter = ({ min = 0, max = 15, start = 0, step = 1, onChange = () => { } }: CounterProp) => {
  const [current, setCurrent] = useState(start)

  useEffect(() => {
    if (current !== start) {
      onChange(current)
    }
  }, [current])

  const inc = () => {
    setCurrent((c) => {
      let diff = c + step
      if (diff > max) diff = max
      return diff
    })
  }
  const dec = () => {
    setCurrent(c => {
      let diff = c - step
      if (diff < min) diff = min
      return diff
    })
  }



  return (
    <div className="w-[90px] flex justify-between px-1 py-1">
      <button
        id="counter-minus"
        className={clsx("relative rounded-full w-[24px] h-[24px]", {' border-2 border-[#fae158]': current !== min})}
        onClick={() => dec()}
      >
        <span
          className={clsx("absolute inset-0 before:content-[''] before:block before:w-3 before:h-[2px]  before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2", {'before:bg-black': current !== min})}
        ></span>
      </button>
      <span>{current}</span>
      <button
        id="counter-plus"
        className={clsx("relative rounded-full  w-[24px] h-[24px] ", {'bg-[#fae158]': current !== max})}
        onClick={() => inc()}
      >
        <span
          className={clsx("absolute inset-0 before:content-[''] before:block before:w-3 before:h-[2px]  before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2after:content-[''] after:block after:w-[2px] after:h-3  after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2", { 'after:bg-black': current !== max, 'before:bg-black': current !== max })}
        ></span>
      </button>
    </div>
  );
}