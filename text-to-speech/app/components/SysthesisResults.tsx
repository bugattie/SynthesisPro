"use client";

import { useEffect, useState } from "react";
import { List, Typography, Card, Button, Spin, Flex } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

import styles from "./synthesisresults.module.css";

const SysthesisResults = () => {
  const [results, setResults] = useState<{ name: string; audioUrl: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/synthesis-results`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch synthesis results");
      }
      const data = await response.json();

      setResults(data.results);
    } catch (error) {
      console.error("Error fetching synthesis results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trigger]);

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <Flex justify="space-between" align="center">
          <Title level={3} className={styles.title}>
            Synthesis Results
          </Title>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            loading={loading}
            disabled={loading}
            onClick={() => setTrigger((prev) => prev + 1)}
            className={styles.refreshButton}
          >
            Refresh
          </Button>
        </Flex>
        {loading ? (
          <Spin size="large" className={styles.spinner} />
        ) : !loading && results.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={results}
            renderItem={(item) => (
              <List.Item>
                <Card className={styles.card}>
                  <div className={styles.cardContent}>
                    <div>
                      <Text strong>Name:</Text> <Text>{item.name}</Text>
                    </div>
                    <audio controls className={styles.audioPlayer}>
                      <source src={item.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <p className={styles.noData}>
            No synthesis results yet. Submit the form to generate audio.
          </p>
        )}
      </div>
    </div>
  );
};

export default SysthesisResults;
