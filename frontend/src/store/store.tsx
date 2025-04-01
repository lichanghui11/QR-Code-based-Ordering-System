import { atom } from 'jotai'
import { type User } from '../types/types.ts'

const cookie = document.cookie; 


export const isLoginAtom = atom(cookie.includes('userid')) 
export const userAtom = atom<User>()
