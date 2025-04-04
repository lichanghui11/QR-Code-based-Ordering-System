import QRCode from "qrcode";
import { type Desk } from "../types/types.ts";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { useInput } from "../hooks/hooks.ts";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { userAtom } from "../store/store.tsx";
import { useAtom } from "jotai";




class DeskManager {
  desks: Desk[] = []
  constructor() {
    makeAutoObservable(this)
  }
  addDesk(...desks: Desk[]) {
    this.desks.push(...desks)
  }
  deleteDesk(idx: number) {
    this.desks.splice(idx, 1)
  }
}

const Desks = observer( () => {
  const [deskManager] = useState(() => new DeskManager());
  const [qrcodes, setQrcodes] = useState<string[]>([]);
  const [user] = useAtom(userAtom);


  useEffect(() => {
    (async () => {
      const res = await axios.get("/api/restaurant/1/desk")
      console.log('the information of desks: ', res.data)
      deskManager.addDesk(...res.data);

    const urls = await Promise.all(
      deskManager.desks.map((desk) => {
        return QRCode.toDataURL(
          `http://192.168.3.11:5173/landing/r/${user.id}/d/${desk.id}`
        );
      })
    )
    setQrcodes(urls);
    console.log('qr code urls: ', urls)
    })()
  }, []);


  return (
    <>
      <div className="">
        <div className="mx-2 text-center bg-[#fae158] py-2 rounded">
          <Link to="/home/add-desk">添加餐桌</Link>
        </div>

        <ul key={Math.random()} className="px-2 bg-[#f9f9f9] mt-2">
          {deskManager.desks.map((desk, idx) => {
            return <DeskItem desk={desk} idx={idx} qrcodes={qrcodes} deskManager={deskManager} />;
          })}
        </ul>
      </div>
    </>
  );
})
type DeskProp = {
  desk: Desk, 
  idx: number, 
  qrcodes: string[],
  deskManager:DeskManager,
}

const DeskItem = observer( ({ desk, idx, qrcodes, deskManager }: DeskProp) => {
  const name = useInput(desk.name);
  const capacity = useInput(String(desk.capacity));
  const [editing, setEditing] = useState(false);

  function editDesk() {
    axios.put('/api/restaurant/1/desk/' + desk.id, {
      name: name.value, 
      capacity: capacity.value,
    }).then(res => {
      console.log('after editing the table info: ', res.data)
      deskManager.desks[idx] = res.data
      setEditing(false)
    })
  }

  function deleteDesk(desk: Desk, idx:number) {
    axios.delete('/api/restaurant/1/desk/' + desk.id).then(res => {
      console.log('delete a table: ', res.data)
    })
    deskManager.deleteDesk(idx)
  }

  function printQRCode(qrSrc: string) {
    // 打开一个新窗口
    const printWindow = window.open("", "_blank", "width=700,height=700");
    // 这里的 width=400,height=400 只是告诉浏览器：我希望弹出一个 400 像素宽、400 像素高的新窗口来显示二维码。当你点击（或自动执行）“打印”后，打印出的页面大小则取决于系统的打印设置、浏览器的打印选项和任何与打印相关的 CSS。

    // 在新窗口写入二维码图片HTML
    // 这里嵌入一个简单的文档结构
    printWindow?.document.write(`
    <html>
      <head>
        <title>打印二维码</title>
      </head>
      <body style="margin: 0; padding: 0; text-align: center;">
        <img src="${qrSrc}" alt="QR Code" />
        <script>
          window.onload = function() {
            window.print();
            // 也可以在打印结束后自动关闭：window.close();
          };
        </script>
      </body>
    </html>
  `);

    printWindow?.document.close();
  }


  if (editing) {
    return (
      <div className="h-[150px] bg-white shadow rounded mb-4 p-2 flex flex-col gap-2">
        <div>
          餐桌名称：
          <input className="border-b outline" {...name} type="text" />
        </div>
        <div>
          用餐人数：
          <input className="border-b outline" {...capacity} type="text" />
        </div>
        <div className="mt-auto">
          <button
            className="bg-[#aaf4a3] px-3 py-1 rounded mr-[15px]"
            onClick={() => editDesk()}
          >
            确认修改
          </button>
          <button
            className="bg-[#f2514f] px-3 py-1 rounded"
            onClick={() => setEditing(false)}
          >
            取消修改
          </button>
        </div>
      </div>
    );
  }

  return (
    <li className="h-[160px] flex justify-between mb-4 shadow bg-white p-2">
      <div className="flex flex-col gap-2">
        <div>
          {" "}
          餐桌名称:{" "}
          <span className="text-[#6f3713] font-bold text-[18px]">
            {desk.name}-{desk.id}
          </span>
        </div>
        <div>用餐人数: {desk.capacity}</div>
        <div className="flex gap-4 mt-auto text-[14px]">
          <button
            onClick={() => setEditing(true)}
            className="bg-[#fae158] py-1 px-2 rounded"
          >
            编辑
          </button>
          <button
            onClick={() => deleteDesk(desk, idx)}
            className="bg-[#fae158] py-1 px-2 rounded"
          >
            删除
          </button>
          <button
            onClick={() => printQRCode(qrcodes[idx])}
            className="bg-[#fae158] py-1 px-2 rounded"
          >
            打印二维码
          </button>
        </div>
      </div>

      <div>
        <img
          data-url={`http://192.168.3.11:5173/landing/r/${desk.rid}/d/${desk.id}`}
          src={qrcodes[idx]}
          alt=""
        />
      </div>
    </li>
  );
})
export default Desks