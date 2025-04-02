import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { type Order } from '../types/types.ts'

type PrintButtonProps = {
  data: Order; // 要打印的数据
  buttonText?: string;
  className?: string;
};

const PrintButton: React.FC<PrintButtonProps> = ({
  data,
  buttonText = "打印",
  className = "cursor-pointer px-4 py-2 rounded-[20px] bg-[#fae158]",
}) => {
  // 用 useRef 指向需要打印的 DOM 元素
  const contentRef = useRef<HTMLDivElement>(null);

  // 使用 useReactToPrint 创建打印函数，content 函数返回需要打印的元素
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    // (可选) 页面样式
    pageStyle: `
      @page { size: A4; margin: 1cm; }
      body { font-family: sans-serif; }
    `,
    // (可选) 打印前回调
    // onBeforePrint: () => console.log("开始打印..."),
    // // (可选) 打印后回调
    // onAfterPrint: () => console.log("打印完成！"),
  });

  // 使用 PrettyData 格式化 JSON 数据，使输出更易读
  const formattedData = JSON.stringify(data)

  return (
    <>
      <button onClick={() => {
        console.log('print......')
        handlePrint()
        console.log('after print......')
        console.log('mounted element: ', contentRef.current)
      }} className={className}>
        {buttonText}
      </button>
      <div style={{ position: 'absolute', left: '-999999px', top: '-99999px', }}>

        <div ref={contentRef}>
          <pre>{formattedData}</pre>
        </div>
      </div>
    </>
  );
};

export default PrintButton;
