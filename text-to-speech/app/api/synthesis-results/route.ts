import { NextResponse } from "next/server";
import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NEXT_PUBLIC_TABLE_NAME;

export async function GET() {
  try {
    const params = {
      TableName: TABLE_NAME!,
    };

    const data = await dynamoDB.scan(params).promise();

    const sortedResults = (data.Items || []).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      message: "Fetched synthesis results successfully",
      results: sortedResults || [],
    });
  } catch (error: any) {
    console.error("Error fetching data from DynamoDB:", error);
    return NextResponse.json(
      { message: "Failed to fetch synthesis results", error: error.message },
      { status: 500 }
    );
  }
}
