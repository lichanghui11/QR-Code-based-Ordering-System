import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex } from "antd";
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import { isLoginAtom } from "../store/store";
import { useAtom } from "jotai";
import { userAtom } from '../store/store.tsx'
import { type User } from '../types/types.ts'


type LoginUser = {
  name: string, 
  password: string,
}
const Login: React.FC = () => {
  const navigate = useNavigate()
  const [, setIsLogin] = useAtom(isLoginAtom)
  const [, setUser] = useAtom(userAtom)

  const onFinish = async (values: LoginUser) => {
    // console.log("Received values of form: ", values);
    //make a request here
    let res: {data: User};
    try {
      res = await axios.post('/api/login', {
        name: values.name, 
        password: values.password,
      })
      /**
       * res.data = {
       *   id: 3, 
       *   name: b, 
       *   title: 'KFC', //title为餐厅名称
       * }
       */
      // console.log('登录返回的结果: ', res.data)

      setUser(() => res.data)
      setIsLogin(true)

      navigate('/home')
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = e.response?.data.msg
        alert(msg)
      } else {
        throw e
      }
    }
  };
  return (
    <div className="px-4 mt-[10vh] w-full">
      <Form className="!mx-auto" name="login" initialValues={{ remember: true }} style={{ maxWidth: 360 }} onFinish={onFinish} >

        <Form.Item name="name" rules={[{ required: true, message: "Please input your Username!" }]} >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: "Please inputyour Password!" }]} >
          <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <a href="">忘记密码</a>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button className="!bg-[#fae158] !text-black" block type="primary" htmlType="submit">
            登录
          </Button>
          或者 <Link to="/register">去注册!</Link>
        </Form.Item>

      </Form>
    </div>
  );
};

export default Login;