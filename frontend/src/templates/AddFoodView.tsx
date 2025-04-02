import { Link, useNavigate } from "react-router"
import { useInput } from "../hooks/hooks.ts"
import { useRef } from "react"
import axios from "axios";
import { observer } from 'mobx-react-lite'


const AddFoodView = observer(() => {
  const imgRef = useRef<HTMLInputElement | null>(null);
  const name = useInput('')
  const price = useInput('')
  const desc = useInput('')
  const category = useInput('')
  const navigator = useNavigate()
  

   function addFood(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("price", price.value);
    formData.append("desc", desc.value);
    formData.append("category", category.value);
    formData.append("img", imgRef.current!.files![0]);
    formData.append("status", 'on');

     axios.post("/api/restaurant/1/food/", formData).then((res) => {
       console.log("add a food: ", res.data);
      navigator('/home/foods')
    });
  }

  return (
    <>
    <div className="relative w-[350px] m-auto bg-[#f9f9f9] shadow rounded mt-[30px]">
      <form action="" className=" flex flex-col gap-4 p-2">
        <div>图片：<input ref={imgRef}  type="file" /></div>
        <div>菜品名称：<input className="border-b-[1px] border-[#555]" {...name} type="text" placeholder="菜品名称" /></div>
        <div>价格：<input className="border-b-[1px] border-[#555]" {...price} type="text"placeholder="菜品价格" /></div>
        <div>描述：<input className="border-b-[1px] border-[#555]" {...desc} type="text" placeholder="菜品描述"/></div>
        <div>分类：<input className="border-b-[1px] border-[#555]" {...category} type="text" placeholder="菜品分类"/></div>
      </form>
        <div className="px-2 py-1">
        <button onClick={(e) => addFood(e)} className="p-2 bg-[#aaf4a3] px-2 py-1 rounded mr-4"><Link to="/home/foods">确认添加</Link></button>
        <button className="p-2 bg-[#f2514f] px-2 py-1 rounded"><Link to="/home/foods">取消添加</Link></button>
      </div>
    </div>
    </>
  )    
})

export default AddFoodView