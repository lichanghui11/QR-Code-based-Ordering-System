import { makeAutoObservable } from "mobx";
import { type Food } from "../types/types.ts";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { useInput } from "../hooks/hooks.tsx";
import { Tabs, TabsProps } from 'antd'
import _ from "lodash";

class FoodManager {
  foods: Food[] = [];
  constructor() {
    makeAutoObservable(this);
  }
  addFood(...foods: Food[]) {
    this.foods.push(...foods);
  }
  setFoodStatus(idx: number, status: "on" | "off") {
    this.foods[idx].status = status;
  }
  deleteFood(idx: number) {
    this.foods.splice(idx, 1);
  }
  get grouped() {
    return _.groupBy(this.foods, 'category')
  }
}

const Foods = observer(() => {
  const [foodManager] = useState(() => new FoodManager());

  let isLoaded = false;
  useEffect(() => {
    if (!isLoaded) {
      axios.get("/api/restaurant/1/food").then((res) => {
        foodManager.addFood(...res.data);
        console.log("the menu: ", ...res.data);
        console.log("foodManager: ", foodManager.foods);
      });
    }
    return () => {
      isLoaded = true;
    };
  }, []);


  const tabProps: TabsProps['items'] = Object.entries(foodManager.grouped).map(entry => {
    const [category, foods] = entry

    return {
      key: category,
      label: category,
      children: (
        <ul className="columns-2 md:columns-3 gap-4  bg-[#f9f9f9]">
          {foods.map((food, idx) => {
            return <FoodItem food={food} idx={idx} foodManager={foodManager} />;
          })}
        </ul>
      ),
    };
  })



  return (
    <>
      <div className="mx-2 text-center bg-[#fae158] py-2 rounded">
        <Link to="/home/add-food">添加菜品</Link>
      </div>

      <Tabs className="!px-4" items={tabProps}/>
    </>
  );
});

type FoodProp = {
  food: Food;
  idx: number;
  foodManager: FoodManager;
};
const FoodItem: React.FC<FoodProp> = observer(
  ({ food, idx, foodManager }: FoodProp) => {
    const [editing, setEditing] = useState(false);

    const name = useInput(food.name);
    const price = useInput(String(food.price));
    const desc = useInput(food.desc);
    const category = useInput(food.category);
    const imgRef = useRef<HTMLInputElement | null>(null);

    async function handleConfirm() {
      console.log("in the handle confirm: the name of food", food.name);
      const formData = new FormData();
      formData.append("name", name.value);
      formData.append("price", price.value);
      formData.append("desc", desc.value);
      formData.append("category", category.value);
      if (imgRef!.current!.files) {
        formData.append("img", imgRef.current!.files![0]);
      }
      formData.append("status", "on");

      const res = await axios.put(
        "/api/restaurant/1/food/" + food.id,
        formData
      );
      console.log("after mutate the food: ", res.data);
      //这个请求会把修改后的菜品信息发送回来
      foodManager.foods[idx] = res.data;
      setEditing(false);
    }

    async function handleDelete(food: Food, idx: number) {
      const res = await axios.delete("/api/restaurant/1/food/" + food.id);
      console.log("deleting a food: ", res.data);
      //这里请求回来的是已经删除了的菜品
      foodManager.deleteFood(idx);
    }

    const list = async (idx: number) => {
      await axios
        .put("/api/restaurant/1/food/" + foodManager.foods[idx].id, {
          status: "on",
        })
        .then((res) => {
          console.log("after list an item : ", res.data);
        });
      foodManager.setFoodStatus(idx, "on");
    };

    const delist = async (idx: number) => {
      await axios.put("/api/restaurant/1/food/" + foodManager.foods[idx].id, {
        status: "off",
      });
      foodManager.setFoodStatus(idx, "off");
    };

    if (editing) {
      return (
        <>
          <div className="bg-white rounded-lg shadow p-2 flex flex-col break-inside-avoid mb-[4px]">
            <div className="mb-[2px]">
              <span className="bg-[#fae158] mr-[4px] py-[2px] rounded">
                名称：
              </span>
              <input
                className="border-b border-[#aaf4]"
                {...name}
                type="text"
              />{" "}
            </div>
            <div className="mb-[2px]">
              <span className="bg-[#fae158] mr-[4px] py-[2px] rounded">
                价格：
              </span>
              <input
                className="border-b border-[#aaf4]"
                {...price}
                type="text"
              />{" "}
            </div>
            <div className="mb-[2px]">
              <span className="bg-[#fae158] mr-[4px] py-[2px] rounded">
                描述：
              </span>
              <input
                className="border-b border-[#aaf4]"
                {...desc}
                type="text"
              />{" "}
            </div>
            <div className="mb-[2px]">
              <span className="bg-[#fae158] mr-[4px] py-[2px] rounded">
                分类：
              </span>
              <input
                className="border-b border-[#aaf4]"
                {...category}
                type="text"
              />{" "}
            </div>
            <div className="mb-[2px]">
              <span className="bg-[#fae158] mr-[4px] py-[2px] rounded ">
                上传图片
              </span>
              <input
                className="border-b border-[#aaf4]"
                ref={imgRef}
                type="file"
              />{" "}
            </div>

            <div className="mt-[5px]">
              <button
                className="bg-[#aaf4a3] px-3 py-1 rounded mr-[15px] cursor-pointer hover:shadow-lg transition-all duration-150  active:outline active:outline-blue-500"
                onClick={() => handleConfirm()}
              >
                确认
              </button>
              <button
                className="bg-[#f2514f] px-3 py-1 rounded cursor-pointer hover:shadow-lg transition-all duration-150  active:outline active:outline-blue-500"
                onClick={() => setEditing(false)}
              >
                取消
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <li className="bg-white rounded-lg shadow p-2 flex flex-col break-inside-avoid mb-[4px]">
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
          {food.status === "on" && (
            <button
              onClick={() => delist(idx)}
              className="bg-[#fae158] px-2 cursor-pointer hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
            >
              下架
            </button>
          )}
          {food.status === "off" && (
            <button
              onClick={() => list(idx)}
              className="bg-[#fae158] px-2 cursor-pointer hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
            >
              上架
            </button>
          )}
          <button
            className="bg-[#fae158] px-2 cursor-pointer hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
            onClick={() => setEditing(true)}
          >
            修改
          </button>

          <button
            onClick={() => handleDelete(food, idx)}
            className="bg-[#fae158] px-2 cursor-pointer hover:shadow-lg transition-all duration-150 rounded active:outline active:outline-blue-500"
          >
            删除
          </button>
        </div>
      </li>
    );
  }
);

export default Foods;
