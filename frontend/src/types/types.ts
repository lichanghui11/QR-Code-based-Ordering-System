export type User = {
  //这里相当于是某个餐厅的信息
  id: number,
  name: string, 
  title: string,
}

export type Details = {
  amount: number, 
  food: Food,
}


export type Order = {
  id: number,
  rid: number | string, 
  did: number | string,
  deskName: string, 
  customCount: number,
  status: 'pending' | 'completed' | 'confirmed',
  timestamp: string,
  totalPrice: number,
  details: Details[],
}

export type Food = {
  id: number,
  rid: number | string, 
  name: string, 
  desc: string, 
  price: number, 
  img: string, 
  category: string,
  status: 'on' | 'off',
}

export type Desk = {
  name: string;
  capacity: number;
  id: number,
};

/**
 * 增加菜品的表单： 
 * FormData = {
 *  name, 
 *  price, 
 *  desc, 
 *  category, 
 *  img: file, 
 * }
 */