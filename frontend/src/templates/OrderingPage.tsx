import { useRequest, useThrottleFn } from "ahooks";
import axios from "axios";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { type Food, type Desk } from "../types/types.ts";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useImmer } from "use-immer";
import clsx from "clsx";
import { ShoppingCartOutlined, DeleteOutlined } from "@ant-design/icons";
import { Drawer, Divider, Empty } from "antd";
import { io, type Socket } from "socket.io-client";
import { SideBar, Checkbox, Skeleton, Modal  } from "antd-mobile";
import _ from "lodash";




function CartIcon() {
  return <ShoppingCartOutlined style={{ fontSize: "24px", color: "#000" }} />;
}

function getMenu(restaurantId: number | string): Promise<Food[]> {
  return axios.get("/api/menu/restaurant/" + restaurantId).then((res) => {
    console.log('the menu of the restaurant: ', res.data)
    return res.data;
  });
}

function getDeskInfo(deskId: number | string): Promise<Desk> {
  //拿到扫码的桌子的信息
  return axios.get("/api/deskinfo?did=" + deskId).then((res) => {
    // console.log("the info of the desk: ", res.data);
    return res.data;
  });
}

//整个页面的组件
export default function OrderingPage() {
  const params = useParams();
  const navigator = useNavigate();
  const [querys] = useSearchParams();
  const [foodCount, updateFoodCount] = useImmer<number[]>([]);
  //foodCount是一个菜单长度的数组，记录客人对每个菜点了多少份
  const [foodSelected, updateFoodSelected] = useImmer<boolean[]>([]);
  // console.log("the count of foods: (foodCount)", foodCount);
  const [deskInfo, setDeskInfo] = useState<Desk | null>(null);
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen((open) => !open);

  const { data: menu, loading } = useRequest(getMenu, {
    defaultParams: [params.restaurantId!],
    onSuccess: (data) => {
      updateFoodCount((foodCount) => {
        foodCount.push(...Array(data.length).fill(0));
      });

      updateFoodSelected((foodSelected) => {
        foodSelected.push(...Array(data.length).fill(true));
      });
    },
  });

  const clientRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (menu) {
      clientRef.current = io(`ws://${location.host}`, {
        path: "/desk",
        transports: ["websocket", "polling"],
        query: {
          desk: `desk:${params.deskId}`, //要加入的桌号
        },
      });

      clientRef.current.on(
        "cart food",
        (data: { amount: number; desk: string; food: Food }[]) => {
          //购物车里面已经有的菜品
          //后加入餐桌的用户打开页面后会接收到这个餐桌已经加入购物车的菜品
          console.log("the food in the cart: ", data);

          for (const info of data) {
            const id = info.food.id;
            const idx = menu.findIndex((it) => it.id === id);
            updateFoodCount((draft) => {
              draft[idx] = info.amount;
            });
          }
        }
      );

      clientRef.current.on(
        "new food",
        (foodInfo: { amount: number; desk: string; food: Food }) => {
          /**
           * foodInfo = {
           *   amount: number, //3
           *   desk: string, //'desk:7'
           *   food: Food, //食物的具体信息
           * }
           */
          //其他同桌客人点的餐品，每个设备都收到消息
          console.log("others ordered a new food: ", foodInfo);

          const foodId = foodInfo.food.id;
          const idx = menu!.findIndex((it) => it.id === foodId);
          console.log("the idx of the food in the menu: ", idx);
          if (idx >= 0) {
            updateFoodCount((foodCount) => {
              foodCount[idx] = foodInfo.amount;
              console.log("the foodCount in the updater: ", foodCount);
            });
          }
          console.log("the foodCount: ", foodCount);
        }
      );

      clientRef.current.on("placeorder success", () => {
        //某个用户已经下单，所有用户都收到消息
        navigator("/place-order-success");
      });

      return () => {
        clientRef.current!.close();
      };
    }
  }, [menu, foodCount]);

  const refreshFoodCount = (foodId: number, count: number) => {
    let idx: number
    updateFoodCount((foodCount) => {
      idx = menu!.findIndex(it => it.id === foodId)

      foodCount[idx] = count;
    });
    //项服务器通知有新的订单
    //服务器会将这个信息发给这个桌子所有正在点菜的人
    //下面这段代码如果放在updateFoodCount里面开发工具会运行两次
    clientRef.current!.emit("new food", {
      desk: "desk:" + params.deskId,
      food: menu![idx!],
      amount: count,
    });
  };

  const selectedFoods = useMemo(() => {
    //这里计算出来的食物都是数量大于零的，不管有没有被check
    return foodCount
      .map((count, idx) => {
        return {
          selected: foodSelected[idx], //每份食物是否被选择
          count: count, //每份食物的数量
          food: menu![idx], //每份食物的详情
        };
      })
      .filter((it) => it.count > 0);
  }, [menu, foodCount, foodSelected]);
  // console.log("the select of foods: (selectedFoods)", selectedFoods);

  const setFoodSected = (id: number, selected: boolean) => {
    updateFoodSelected((foodSelected) => {
      foodSelected[id] = selected;
    });
  };

  const totalAmount = useMemo(() => {
    return foodCount.filter((count) => count !== 0).reduce((a, b) => a + b, 0);
  }, [foodCount]);

  const totalPrice = useMemo(() => {
    return selectedFoods
      .filter((food) => food.selected)
      .map((it) => {
        return it.food.price * it.count;
      })
      .reduce((a, b) => a + b, 0).toFixed(2)
  }, [selectedFoods]);

  const clearCart = () => {
    updateFoodCount((draft) => {
      draft.fill(0);
    });
  };
  useEffect(() => {
    console.log("foodCount updated:", foodCount);
  }, [foodCount]);

  const { loading: loading1 } = useRequest(getDeskInfo, {
    defaultParams: [params.deskId!],
    refreshDeps: [params.deskId], // 每次 params.deskId 改变都发起请求
    onSuccess: (data) => {
      setDeskInfo(data);
    },
  });
  // console.log("new desk information: ", newDeskInfo);

  const placeOrder = async () => {
    const order = {
      deskName: deskInfo!.name,
      customCount: querys.get("count"),
      totalPrice,
      foods: selectedFoods
        .filter((it) => it.selected)
        .map((it) => {
          return {
            amount: it.count,
            food: it.food,
          };
        }),
    };

    if (Number(order.totalPrice) === 0) {
      alert('您没有选择任何餐品哦！')
      return
    }

    await axios.post(
      `/api/restaurant/${deskInfo!.rid}/desk/${deskInfo!.id}/order`,
      order
    );
    navigator("/place-order-success");
  };

  const groupedMenu = useMemo(() => {
    if (menu) {
      return _.groupBy(menu, "category");
    } else {
      return {};
    }
  }, [menu]);
  console.log("grouped menu: ", groupedMenu);
  
  //侧边栏当前激活项目的key
  const [activeKey, setActiveKey] = useState(Object.keys(groupedMenu)[0])
  const { run: handleScroll } = useThrottleFn(
    () => {
      //默认选第一个
      let currentKey = Object.keys(groupedMenu)[0]
      for (const item of Object.keys(groupedMenu)) {
        const element = document.getElementById(`anchor-${item}`)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        if (rect.top <= 150) {
          currentKey = item
        } else { 
          break
        }
      }
      setActiveKey(currentKey)
      
    },
    {
      leading: true, 
      trailing: true,
      wait: 100,
    }
  )

  const mainElementRef = useRef<HTMLDivElement>(null)
  // useEffect(() => {
  //   const mainElement = mainElementRef.current

  //   if (!mainElement) return

  //   mainElement.addEventListener('scroll', handleScroll)
  //   return () => {
  //     mainElement.removeEventListener('scroll', handleScroll)
  //   }
  // }, []1)
function showFoodDetail(food: Food) {
  Modal.show({
    // 弹窗中的自定义内容
    content: (
      <div style={{ textAlign: "center" }}>
        <img
          src={food.img}
          style={{ width: "100%", borderRadius: 8 }}
        />
        <h3 style={{ margin: "12px 0 4px" }}>{food.name}</h3>
        <p style={{ fontSize: 14, color: "#999" }}>{food.desc}</p>
      </div>
    ),
    showCloseButton: true, // 右上角叉叉
    closeOnMaskClick: true, // 点蒙层关闭
    bodyStyle: {
      borderRadius: "8px",
      overflow: "hidden",
    },
  });
}

  //======================条件只能写在最底层=====================//
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton.Title animated/>
        <Skeleton.Paragraph lineCount={4} animated/>
        <Skeleton.Title animated/>
        <Skeleton.Paragraph lineCount={9} animated/>
      </div>
    );
  }
  if (loading1) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton.Title animated/>
        <Skeleton.Paragraph lineCount={4} animated/>
        <Skeleton.Title animated/>
        <Skeleton.Paragraph lineCount={9} animated/>
      </div>
    );
  }
  return (
    <>
      <div className="xbg-[#f9f9f9] pt-1 h-screen flex flex-col overflow-hidden bg-[url('/background.jpg')] bg-cover bg-no-repeat w-screen ">
        <div className="bg-white opacity-80 rounded w-[90vw] mx-auto  px-2 h-[15vh] flex ">
          <div className=" flex items-center justify-center rounded mr-2 ">
            <img
              src="/avatar.jpg"
              className="w-[70px] h-[70px] rounded"
              alt="图片占位符"
            />
          </div>

          <div className="my-auto">
            <div className="font-bold text-[24px]">
              <span className="font-normal text-[16px] mr-3">欢迎来到</span>
              {deskInfo!.title}
            </div>

            <div className="text-[12px] relative text-rose-400">
              <span className="">
                评分高
                <span className="border-l-[1px] inline-block h-2 mx-2 text-[#9e9e9e] "></span>
              </span>
              <span className="">
                放心吃
                <span className="border-l-[1px] inline-block h-2 mx-2 text-[#9e9e9e] "></span>
              </span>
              营养又健康
            </div>
          </div>
        </div>

        <div
          data-name="左边分类 右边详情"
          className=" flex flex-1 overflow-auto  rounded-t-[16px] shadow opacity-97"
        >
          <div className="overflow-auto">
            <SideBar
              activeKey={activeKey}
              onChange={(key) => {
                document.getElementById(`anchor-${key}`)?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className=""
            >
              {Object.keys(groupedMenu).map((category) => {
                return <SideBar.Item title={category} key={category} />;
              })}
            </SideBar>
          </div>

          <div
            data-name="菜品循环"
            className="px-[4px] rounded bg-white xpb-[40px] grow overflow-auto "
            ref={mainElementRef}
            onScroll={() => handleScroll()}
          >
            {Object.entries(groupedMenu).map((entry, i) => {
              const [key, foodItem] = entry;
              return (
                <div key={i} className="">
                  <h1 className="text-[20px] font-bold sticky bg-[#fae158] my-0 z-[99] rounded  "id={`anchor-${key}`}>
                    {key}
                  </h1>
                  {foodItem.map((food) => {
                    const id = menu!.findIndex((it) => it.id === food.id);
                    return (
                      <div key={food.id} className="mb-5 ">
                        <div className="flex gap-[5px]">
                          <img
                            className="w-20 rounded "
                            src={`/upload/${food.img}`}
                            onClick={() => showFoodDetail(food)}
                          />

                          <div className="">
                            <div>
                              <span className="font-bold text-[20px] text-[#6f3713]">
                                {food.name}
                              </span>{" "}
                              <span className="border-l-[1px] inline-block h-2 mx-1 text-[#9e9e9e] "></span>
                              <span>{food.category}</span>
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
                                value={foodCount[id!]}
                                step={1}
                                onChange={(c) => refreshFoodCount(food.id, c)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <Divider className="!text-[12px] !text-[#9e9e9e]">
              我是有底线的
            </Divider>
            <div className="h-[calc(100%_-_100px)]"></div>
          </div>
        </div>

        <div
          data-name="底部购物车"
          className="z-[99999] fixed bottom-[20px] bg-[#232426] left-4 rounded-[20px] h-[40px]  right-4"
        >
          <div className="text-white flex justify-between gap-4 ">
            <button
              onClick={() => toggleDrawer()}
              className="relative bg-[#fae158] rounded-l-[20px] h-[40px] px-4"
            >
              <CartIcon />
              <span className="absolute bg-[#e14f] rounded-full flex items-center justify-center w-4 h-4 text-[10px] top-[2px] left-8">
                {totalAmount}
              </span>
            </button>

            <span className="flex flex-col">
              <span>
                <span className="text-[12px] mr-[3px]">¥</span>
                <span className="font-bold">{totalPrice}</span>
              </span>

              <span className="text-[10px] font-normal text-[#fae158]">
                下单越多，优惠越大哦！
              </span>
            </span>

            <button
              onClick={() => placeOrder()}
              className="bg-[#fae158] ml-auto h-[40px] rounded-r-[20px] inline-block text-black font-bold px-4"
            >
              去结算
            </button>
          </div>
        </div>

        <div data-name="购物车抽屉">
          <FoodCart
            menu={menu!}
            foodCount={foodCount}
            open={open}
            setOpen={setOpen}
            refreshFoodCount={refreshFoodCount}
            selectedFoods={selectedFoods}
            setFoodSelected={setFoodSected}
            clearCart={clearCart}
          />
        </div>
      </div>
    </>
  );
}

//计数器组件
//这个Counter组件是一个受控组件，多个地方使用这个组件使用的是同一个值
type CounterProp = {
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: (newValue: number) => void;
};
const Counter = ({ min, max, value, step, onChange }: CounterProp) => {
  const inc = () => {
    const diff = Math.min(value + step!, max!);
    onChange(diff);
  };
  const dec = () => {
    const diff = Math.max(value - step!, min!);
    onChange(diff);
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
            "absolute inset-0 before:content-[''] before:block before:w-3 before:h-[2px]  before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:z-50",
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
type SelectedFood = {
  count: number;
  selected: boolean;
  food: Food;
};

type FoodCartProp = {
  menu: Food[];
  foodCount: number[];
  refreshFoodCount: (current: number, idx: number) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFoods: SelectedFood[];
  setFoodSelected: (id: number, selected: boolean) => void;
  clearCart: () => void;
};
const FoodCart: React.FC<FoodCartProp> = ({
  menu,
  foodCount,
  refreshFoodCount,
  open,
  setOpen,
  selectedFoods,
  setFoodSelected,
  clearCart,
}: FoodCartProp) => {
  const onClose = () => {
    setOpen(false);
  };

  //这里用来设置打开抽屉之后，主屏幕不能滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // 清理函数，确保卸载后恢复滚动
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Drawer
        placement="bottom"
        onClose={onClose}
        open={open}
        zIndex={99}
        closable={false} // 取消左上角的叉叉按钮
        className="px-0 rounded-top-[10px]"
        styles={{
          content: {
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflow: "hidden", // 防止内容溢出显示圆角
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className="fixed w-full bg-white z-[49]">
          <div className="text-[12px] bg-[#fef9e5] text-center py-2  rounded-t-[16px] w-full">
            温馨提示：请适量点餐
          </div>
          <div className="px-4 py-2 flex border-b border-[#f9f9f9]">
            <span className="">已选商品</span>
            <button className="text-[#8c8c8c] text-[12px] ml-auto cursor-pointer">
              {(foodCount.filter((it) => it > 0).length > 0 && (
                  <DeleteOutlined />
                ) && <span onClick={() => clearCart()}>清空购物车</span>) || (
                <span className="text-[#e14f63]">购物车是空的</span>
              )}
            </button>
          </div>
        </div>

        <div className="食物循环 rounded bg-[#f9f9f9] px-4 pt-26 z-1 mb-[100px]">
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
            .map((it, id) => (
              <div
                key={it.food!.id}
                className="mb-[10px] bg-white rounded shadow"
              >
                <div className="flex gap-1 shrink-0 items-center">
                  <Checkbox
                    checked={selectedFoods[id].selected}
                    onChange={(checked) => setFoodSelected(it.idx, checked)}
                    className="px-2"
                  />

                  {/* <input
                    checked={selectedFoods[id].selected}
                    onChange={(e) => setFoodSelected(it.idx, e.target.checked)}
                    className="px-2"
                    type="checkbox"
                  /> */}
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
                    onChange={(c) => refreshFoodCount(it.food!.id, c)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
            ))}
          {foodCount.filter((it) => it > 0).length > 0 ? (
            <Divider className="!text-[12px] !text-[#9e9e9e]">
              我是有底线的
            </Divider>
          ) : (
            <Empty description="购物车是空的" />
          )}
        </div>
      </Drawer>
    </>
  );
};
