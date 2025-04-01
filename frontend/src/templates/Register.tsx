import React from "react";
import { Form, Input, Button, Select, Row, Col } from "antd";
import { Link } from "react-router-dom";

const { Option } = Select;

const Register: React.FC = () => {
  // 提交表单并且数据验证成功后会触发
  const onFinish = (values: unknown) => {
    console.log("Received values of form: ", values);
    //这里发送注册用户的请求
  };

  // 电话号码输入框前缀
  // 注意：为了演示方便，这里直接给 initialValue 设为 "86"
  const prefixSelector = (
    <Form.Item name="prefix" noStyle initialValue="86">
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    </Form.Item>
  );

  return (
    <div className="flex w-full">
      <Form className="!mx-auto !mt-[10px] !px-4" onFinish={onFinish}>
        {/* 用户名 */}
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>
        {/* 密码 */}
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: "Please input your password!" }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        {/* 确认密码 */}
        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        {/* 邮箱 */}
        <Form.Item
          name="email"
          label="电子邮箱"
          rules={[
            { type: "email", message: "The input is not valid E-mail!" },
            { required: true, message: "Please input your E-mail!" },
          ]}
        >
          <Input />
        </Form.Item>
        {/* 电话号码 */}
        <Form.Item
          name="phone"
          label="电话号码"
          rules={[
            { required: true, message: "Please input your phone number!" },
            // 可以根据需求加入自己的正则校验
            // { pattern: /^\d{7,14}$/, message: 'Invalid phone number format!' },
          ]}
        >
          <Input addonBefore={prefixSelector} style={{ width: "100%" }} />
        </Form.Item>
        {/* 验证码 */}
        <Form.Item label="Captcha" extra="We must make sure you are a human.">
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please input the captcha you got!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* 演示用按钮，实际中可调用后端接口获取验证码 */}
              <Button>获取验证码</Button>
            </Col>
          </Row>
        </Form.Item>
        {/* 提交按钮 */}
        <Form.Item>
          <Button
            className="!bg-[#fae158] !text-black"
            type="primary"
            htmlType="submit"
          >
            注册
          </Button>
        或者 <Link to="/login">去登录!</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
