"use client";

import { Typography } from "antd";

import UserInput from "./components/UserInput";
import SysthesisResults from "./components/SysthesisResults";
import styles from "./page.module.css";

const { Title } = Typography;

export default function Home() {
  return (
    <div className={styles.container}>
      <Title level={3} className={styles.title}>
        Text to Speech Synthesizer
      </Title>
      <UserInput />
      <SysthesisResults />
    </div>
  );
}
