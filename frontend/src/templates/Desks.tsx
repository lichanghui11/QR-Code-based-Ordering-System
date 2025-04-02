import QRCode from 'qrcode'
import {type Desk} from '../types/types.ts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router'


export default function Desks() {
  const [desks, setDesks] = useState<Desk[]>([])
  const [qrcodes, setQrcodes] = useState<string[]>([])

  useEffect(() => {
    Promise.all(
      desks.map(desk => {
        return QRCode.toDataURL('http://192.168.3.11:5173/rest/1/desk/' + desk.id)
      })
    ).then(urls => {
      setQrcodes(urls)
      // console.log('qr code urls: ', urls)
    })
  }, [desks])

  useEffect(() => {
    axios.get('/api/restaurant/1/desk').then(res => {
      // console.log('the information of desks: ', res.data)
      setDesks(() => res.data)
    })
  }, [])



  return (
    <>
      <div className="">
        <div className="mx-2 text-center bg-[#fae158] py-2 rounded">
          <Link to="/home/add-desk">添加餐桌</Link>
        </div>

        <ul className='px-2 bg-[#f9f9f9] '>
          {desks.map((desk, idx) => {
            return (
              <li className="flex justify-between mb-4 shadow bg-white p-2">
                <div className="flex flex-col gap-2">
                  <div>
                    {" "}
                    餐桌名称:{" "}
                    <span className="text-[#6f3713] font-bold text-[18px]">
                      {desk.name}
                    </span>
                  </div>
                  <div>用餐人数: {desk.capacity}</div>
                  <div className="flex gap-4 mt-auto text-[14px]">
                    <button className="bg-[#fae158] py-1 px-2 rounded">
                      编辑
                    </button>
                    <button className="bg-[#fae158] py-1 px-2 rounded">
                      删除
                    </button>
                    <button className="bg-[#fae158] py-1 px-2 rounded">
                      打印二维码
                    </button>
                  </div>
                </div>

                <div><img data-url={`http://192.168.3.11:5173/r/1/d/${desk.id}`} src={qrcodes[idx]} alt="" /></div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}