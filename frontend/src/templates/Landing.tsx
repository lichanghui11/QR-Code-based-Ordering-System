import {useState} from 'react'
import clsx from 'clsx'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useRequest } from 'ahooks'
import { deskInfoAtom } from '../store/store'
import { useAtom } from 'jotai'
import { Skeleton } from 'antd-mobile'


function getDeskInfo(deskId: number | string) {
  //拿到扫码的桌子的信息
  return axios.get('/api/deskinfo?did=' + deskId).then(res => {
    console.log('the info of the table: ', res.data)
    return res.data
  })
}


export default function Landing() {
  const [customCount, setCustomCount] = useState(0)
  const navigator = useNavigate()
  const params = useParams()
  console.log('params in the href: ', params)
  const [, setDeskInfo] = useAtom(deskInfoAtom)



  const { data, loading } = useRequest(getDeskInfo, {
    defaultParams: [params.deskId!],
    onSuccess: () => {
      setDeskInfo(data.data)
    }
  })
  

  function startOrdring() {
    if (customCount !== 0) {
      navigator(`/r/${params.restaurantId}/d/${params.deskId}?count=${customCount}`)
    } else {
      alert('请选择用餐人数')
    }

  }
  if (loading ) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={4} animated />
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={9} animated />
      </div>
    );
  }

  return (
    <>
      <div className=" bg-[url('/background.jpg')] bg-cover bg-no-repeat h-[100vh] flex ">
        <div className='w-full m-auto bg-white opacity-95 p-4 rounded '>

        <div className="text-center my-4 bg-[#fae158] rounded py-2">
          <span className="font-bold text-[18px]">
            {loading ? "Loading..." : data.title + " : " + data.name}
          </span>
        </div>
        <div className="font-bold my-2">请选择用餐人数：</div>
        <div className="grid gap-3 grid-cols-6 ">
          {new Array(14).fill(0).map((_, idx) => {
            return (
              <span
                key={idx}
                className={clsx(
                  "cursor-pointer w-8 h-8 flex justify-center items-center bg-[#f9f9f9] rounded-full",
                  { "bg-[#fae158] text-black": customCount === idx + 1 }
                )}
                onClick={() => setCustomCount(idx + 1)}
              >
                {idx + 1}
              </span>
            );
          })}
        </div>
        <button
          onClick={() => startOrdring()}
          className="mt-4 px-2 py-1 rounded bg-[#fae158]"
        >
          开始点餐
        </button>
      </div>
        </div>
    </>
  );
}