"use client";

import { Button, Form, Input, message } from "antd";
import { useState } from "react";

import styles from "./userinput.module.css";

const UserInput = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { name: string; text: string }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/synthesize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        const result = await response.json();
        messageApi.success(
          result.message ||
            "Speech synthesis complete! Click on the Refresh icon"
        );
        console.log("Synthesis result:", result);

        form.resetFields();
      } else {
        const error = await response.json();
        messageApi.error(
          `Failed to synthesize speech: ${error.message || "Unknown error"}`
        );
      }
    } catch (error) {
      messageApi.error("An error occurred while synthesizing speech.");
      console.error("Error synthesizing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form} // Bind the form instance to the Form component
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <Form.Item
          label="What's your name?"
          name="name"
          rules={[{ required: true, message: "Please enter your name!" }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>
        <Form.Item
          label="Text to Synthesize"
          name="text"
          rules={[{ required: true, message: "Please enter the text!" }]}
        >
          <Input.TextArea
            placeholder="Enter the text you want to synthesize"
            rows={4}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            block
          >
            Synthesize
          </Button>
        </Form.Item>
        <a
          href="https://www.linkedin.com/in/mohsin-sheikhani-31655b195/"
          target="_blank"
          rel="noreferrer"
          className={styles.anchor}
        >
          👉 Follow me on LinkedIn 👈
        </a>
      </Form>
    </>
  );
};

export default UserInput;
