import { Link, useNavigate } from 'react-router';
import { useInput } from '../hooks/hooks.ts'
import axios from 'axios';



export default function AddDeskView() {
  const name = useInput('')
  const capacity = useInput('')
  const navigator = useNavigate();

  function addDesk() {

    axios.post("/api/restaurant/1/desk/", {
      name: name.value, 
      capacity: capacity.value,
    }).then((res) => {
      console.log("add a desk: ", res.data);
      navigator("/home/desks");
    });

  }

  return (
    <>
      <div className="relative w-[350px] m-auto bg-[#f9f9f9] shadow rounded mt-[30px]">
        <form action="" className=" flex flex-col gap-4 p-2">
          
          <div>
            餐桌名称：
            <input
              className="border-b-[1px] border-[#555]"
              {...name}
              type="text"
            />
          </div>
         
          <div>
            用餐人数：
            <input
              className="border-b-[1px] border-[#555]"
              {...capacity}
              type="text"
            />
          </div>
        </form>
        <div className="px-2 py-1">
          <button
            onClick={(e) => addDesk(e)}
            className="p-2 bg-[#aaf4a3] px-2 py-1 rounded mr-4"
          >
            <Link to="/home/desks">确认添加</Link>
          </button>
          <button className="p-2 bg-[#f2514f] px-2 py-1 rounded">
            <Link to="/home/desks">取消添加</Link>
          </button>
        </div>
      </div>
    </>
  );
}