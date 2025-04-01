export type User = {
  //这里相当于是某个餐厅的信息
  id: number,
  name: string, 
  title: string,
}

export type Order = {
  rid: number | string, 
  did: number | string,
  deskName: string, 
  customCount: number,
  details: string,
  status: string,
  timestamp: string,
  totalPrice: number,
}

export type Food = {
  rid: number | string, 
  name: string, 
  desc: string, 
  price: number, 
  img: string, 
  category: string,
  status: string,
}