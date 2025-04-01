import axios from 'axios'
import { useInput } from '../hooks/hooks.ts'


export default function Login() {
  const name = useInput('')
  const password  = useInput('')
  function login() {
    axios.post('/api/login', {
      name: name, 
      password: password,
    }).then(res => {
      console.log(res.data)
    })
  }
  

  return (
    <div>
      <div>用户名: <input name='name' type="text" {...name} /></div>
    
      <div>密码: <input name="password" type="password" {...password}/></div>
      <button onClick={login}>登录</button>
    </div>
  )
}