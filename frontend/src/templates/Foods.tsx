import { makeAutoObservable } from "mobx";
import { type Food } from "../types/types.ts";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";

class FoodManager {
  foods: Food[] = [];
  constructor() {
    makeAutoObservable(this);
  }
  addFood(...foods: Food[]) {
    this.foods.push(...foods);
  }
  setFoodStatus(idx: number, status: 'on' | 'off') {
    this.foods[idx].status = status
  }
}

const Foods = observer(() => {
  const [foodManager] = useState(() => new FoodManager());

  let isLoaded = false;
  useEffect(() => {
    if (!isLoaded) {
      axios.get("/api/restaurant/1/food").then((res) => {
        console.log("the menu: ", ...res.data);
        foodManager.addFood(...res.data);
      });
    }
    return () => {
      isLoaded = true;
    };
  }, [location]);


  const list = async (idx: number) => {
    await axios.put('/api/restaurant/1/food/' + foodManager.foods[idx].id, {
      status: 'on'
    }).then(res => {
      console.log('after list an item : ', res.data)
    })
    foodManager.setFoodStatus(idx, 'on')
  }

  const delist = async (idx: number) => {
    await axios.put('/api/restaurant/1/food/' + foodManager.foods[idx].id, {
      status: 'off'
    })
    foodManager.setFoodStatus(idx, 'off')
  }

  return (
    <>
        <div className="mx-2 text-center bg-[#fae158] py-2 rounded">
          <Link to="/home/add-food">添加菜品</Link>
        </div>
      <ul className="columns-2 md:columns-3 gap-4 px-2 bg-[#f9f9f9]">
        {foodManager.foods.map((food, idx) => {
          return (
            <li
              key={food.id}
              className="bg-white rounded-lg shadow p-2 flex flex-col break-inside-avoid mb-[4px]"
            >
              <div>
                <img
                  src={"http://192.168.3.11:5173/upload/" + food.img}
                  className="rounded"
                />

                <span className="text-[#6f3713] font-bold text-[18px]">
                  {food.name}
                </span>
                <span className="border-l-[1px] border-[#7f7f7e] pr-1 ml-[4px] inline-block h-[10px]"></span>
                <span className="text-[14px] ">{food.category}</span>
                <p className="text-[12px]">{food.desc}</p>

                <span className="flex font-bold">
                  <span className="text-[#e14f63] text-[12px] flex items-end mr-[2px]">
                    ¥
                  </span>
                  <span className="text-[#e14f63]">{food.price}</span>
                  <span className="ml-auto">
                    {food.status === "on" ? "在售" : "已售罄"}
                  </span>
                </span>
              </div>

              <div className="flex justify-around text-[13px] rounded mt-2">
                {food.status === 'on' && <button onClick={() => delist(idx)} className="bg-[#fae158] px-2">下架</button>}
                {food.status === 'off' && <button onClick={() => list(idx)} className="bg-[#fae158] px-2">上架</button>}
                <button className="bg-[#fae158] px-2">修改</button>
                
                <button className="bg-[#fae158] px-2">删除</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
});
export default Foods;
