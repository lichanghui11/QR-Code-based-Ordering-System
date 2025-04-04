import { atom } from 'jotai'
import { type User, type Desk } from '../types/types.ts'

const cookie = document.cookie; 


export const isLoginAtom = atom(cookie.includes('userid')) 
export const userAtom = atom<User>(//这个atom暂时不确定是否需要使用
  {
    id: 3,//这里为开发方便先放入初始值
    name: 'b',
    title: 'KFC', //title为餐厅名称
  }
)

export const deskInfoAtom = atom<null | Desk>(null)