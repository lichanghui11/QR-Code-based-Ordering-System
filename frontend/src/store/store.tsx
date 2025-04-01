import { atom } from 'jotai'

const cookie = document.cookie; 

export const isLoginAtom = atom(cookie.includes('userid')) 
