import { useRequest} from "ahooks"
import axios from "axios"
import { useParams } from "react-router"
import { useAtom } from 'jotai'
import { userAtom } from '../store/store.tsx'
import { Skeleton } from "antd"
import { type Food } from '../types/types.ts'
import { useState } from "react";
import { useImmer } from 'use-immer'
import clsx from 'clsx'
import { ShoppingCartOutlined, DeleteOutlined } from "@ant-design/icons";
import React from "react";
import { Drawer } from "antd";

function CartIcon() {
  return <ShoppingCartOutlined style={{ fontSize: "24px", color: "#000" }} />;
}

function getMenu(restaurantId: number | string): Promise<Food[]> {
  return axios.get("/api/menu/restaurant/" + restaurantId).then((res) => {
    return res.data;
  });
}

//整个页面的组件
export default function OrderingPage() {
  const params = useParams();
  const [user] = useAtom(userAtom);
  const [foodCount, updateFoodCount] = useImmer<number[]>([]);
  //foodCount是一个菜单长度的数组，记录客人对每个菜点了多少份
  console.log("the count of foods: ", foodCount);

  const { data, loading } = useRequest(getMenu, {
    defaultParams: [params.restaurantId!],
    onSuccess: (data) => {
      updateFoodCount((foodCount) => {
        foodCount.push(...Array(data.length).fill(0));
      });
    },
  });

  console.log("the info of the menu: ", data);

  const refreshFoodCount = (current: number, idx: number) => {
    updateFoodCount((foodCount) => {
      foodCount[idx] = current;
    });
  };

  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen((open) => !open);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <>
      <div className="bg-[#fae158] h-full pt-4">
        <div className="bg-white shadow mb-1 mx-4 rounded ">
          <div>{user.title}</div>
          <div>欢迎您的光临</div>
          <div>有折扣哦</div>
        </div>

        <div data-name="菜品循环" className="p-4 rounded bg-white pb-[40px]">
          {data!.map((food: Food, idx: number) => (
            <div key={food.id} className="mb-10 ">
              <div className="flex justify-between">
                <img className="w-30 rounded " src={`/upload/${food.img}`} />
                <div className="ml-2">
                  <div>
                    <span className="font-bold text-[20px] text-[#6f3713]">
                      {food.name}
                    </span>{" "}
                  </div>
                  <div>
                    <span className="text-[#9e9e9e] text-[14px]">
                      {food.desc}
                    </span>{" "}
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[12px] text-[#e14f63] flex items-end">
                      ¥
                      <span className="text-[#e14f63] flex items-end text-[18px] ">
                        {food.price}
                      </span>
                    </span>
                    <Counter
                      min={0}
                      max={10}
                      value={foodCount[idx]}
                      step={1}
                      onChange={(c) => refreshFoodCount(c, idx)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          data-name="底部购物车"
          className="z-50 fixed bottom-[20px] bg-[#232426] left-4 rounded-[20px] h-[40px]  right-4"
        >
          <div className="text-white flex justify-between gap-4 ">
            <button
              onClick={() => toggleDrawer()}
              className="relative bg-[#fae158] rounded-l-[20px] h-[40px] px-4"
            >
              <CartIcon />
              <span className="absolute bg-[#e14f] rounded-full flex items-center justify-center w-4 h-4 text-[10px] top-[2px] left-8">
                {foodCount
                  .filter((count) => count !== 0)
                  .reduce((a, b) => a + b, 0)}
              </span>
            </button>

            <span className="flex flex-col">
              <span>
                <span className="text-[12px] mr-[3px]">¥</span>
                <span className="font-bold">
                  {data!
                    .map((food) => food.price)
                    .map((price, idx) => {
                      return price * foodCount[idx];
                    })
                    .reduce((a, b) => a + b, 0)}
                </span>
              </span>

              <span className="text-[10px] font-normal text-[#fae158]">
                下单越多，优惠越大哦！
              </span>
            </span>

            <button className="bg-[#fae158] ml-auto h-[40px] rounded-r-[20px] inline-block text-black font-bold px-4">
              去结算
            </button>
          </div>
        </div>

        <div data-name="购物车抽屉">
          <FoodCart
            menu={data}
            foodCount={foodCount}
            open={open}
            setOpen={setOpen}
            refreshFoodCount={refreshFoodCount}
          />
        </div>
      </div>
    </>
  );
}

//计数器组件
type CounterProp = {
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: (newValue: number) => void;
};
export const Counter = ({ min, max, value, step, onChange }: CounterProp) => {

  const inc = () => {
    const diff = Math.min(value + step!, max!)
    onChange(diff)
  };
  const dec = () => {
    const diff = Math.max(value - step!, min!)
    onChange(diff)
  };

  return (
    <div className="w-[90px] flex justify-between px-1 py-1">
      <button
        id="counter-minus"
        className={clsx("relative rounded-full w-[24px] h-[24px]", {
          " border-2 border-[#fae158]": value !== min,
        })}
        onClick={() => dec()}
      >
        <span
          className={clsx(
            "absolute inset-0 before:content-[''] before:block before:w-3 before:h-[2px]  before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
            { "before:bg-black": value !== min }
          )}
        ></span>
      </button>
      <span>{value}</span>
      <button
        id="counter-plus"
        className={clsx("relative rounded-full  w-[24px] h-[24px] ", {
          "bg-[#fae158]": value !== max,
        })}
        onClick={() => inc()}
      >
        <span
          className={clsx(
            "absolute inset-0 before:content-[''] before:block before:w-3 before:h-[2px]  before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 after:content-[''] after:block after:w-[2px] after:h-3  after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
            {
              "after:bg-black": value !== max,
              "before:bg-black": value !== max,
            }
          )}
        ></span>
      </button>
    </div>
  );
};




//购物车抽屉组件
type FoodCartProp = {
  menu: Food[];
  foodCount: number[];
  refreshFoodCount: (current: number, idx: number) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const FoodCart: React.FC<FoodCartProp> = ({
  menu,
  foodCount,
  refreshFoodCount,
  open,
  setOpen,
}: FoodCartProp) => {
  function clearCart() {}

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Drawer
        placement="bottom"
        onClose={onClose}
        open={open}
        zIndex={40}
        closable={false} // 取消左上角的叉叉按钮
        className="px-0 rounded-top-[10px]"
        bodyStyle={{ padding: 0 }}
        styles={{
          content: {
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflow: "hidden", // 防止内容溢出显示圆角
          },
        }}
      >
        <div className="fixed w-full bg-white z-[49]">
          <div className="text-[12px] bg-[#fef9e5] text-center py-2  rounded-t-[16px] w-full">
            温馨提示：请适量点餐
          </div>
          <div className="px-4 py-2 flex border-b border-[#f9f9f9] mb-4">
            <span className="">已选商品</span>
            <button
              onClick={() => clearCart()}
              className="text-[#8c8c8c] text-[12px] ml-auto cursor-pointer"
            >
              {(foodCount.filter((it) => it > 0).length > 0 && (
                  <DeleteOutlined />
                ) &&
                "清空购物车") || (
                <span className="text-[#e14f63]">购物车是空的</span>
              )}
            </button>
          </div>
        </div>

        <div className=" rounded bg-white px-4 mb-16 mt-26 z-1">
          {foodCount
            .map((count, idx) => {
              return {
                count,
                idx,
                food: null as Food | null,
              };
            })
            .filter((it) => it.count > 0)
            .map((it) => {
              it.food = menu[it.idx];
              return it;
            })
            .map((it) => (
              <div key={it.food!.id} className="mb-10 ">
                <div className="flex gap-2">
                  <img
                    className="w-30 rounded "
                    src={`/upload/${it.food!.img}`}
                  />

                  <div className="mr-auto flex flex-col gap-2">

                    <div className="">
                      <span className="font-bold text-[20px] text-[#6f3713]">
                        {it.food!.name}
                      </span>{" "}
                    </div>
                    <div>
                      <span className="text-[#9e9e9e] text-[14px]">
                        {it.food!.desc}
                      </span>{" "}
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[12px] text-[#e14f63] flex items-end">
                        ¥
                        <span className="text-[#e14f63] flex items-end text-[18px] ">
                          {it.food!.price}
                        </span>
                      </span>
                    </div>

                  </div>

                  <Counter
                    value={foodCount[it.idx]}
                    onChange={(c) => refreshFoodCount(c, it.idx)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
            ))}
        </div>
      </Drawer>
    </>
  );
};