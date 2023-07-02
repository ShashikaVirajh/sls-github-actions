'use strict';

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 3,
  timeout: 10000,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDBClient, { 
  marshallOptions: { 
    removeUndefinedValues: true 
  } 
});

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)
  };
};

module.exports.createNote = async (event) => {
  const data = JSON.parse(event.body);
 
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    }

    await documentClient.send(new PutCommand(params));
    return send(201, data);
  } catch (error) {
    return send(500, error.message);
  }
};

module.exports.updateNote = async (event) => {
  const notesId = event.pathParameters.id
  const data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId }, 
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body',
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    }

    await documentClient.send(new UpdateCommand(params));
    return send(200, data);
  } catch (error) {
    return send(500, error.message);
  }
};

module.exports.deleteNote = async (event) => {
  const notesId = event.pathParameters.id

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    }

    await documentClient.send(new DeleteCommand(params));
    return send(200, notesId);
  } catch (error) {
    return send(500, error.message);
  }
};

module.exports.getAllNotes = async (_event) => {
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await documentClient.send(new ScanCommand(params));
    return send(200, notes);
  } catch (err) {
    return send(500, err.message);
  }
};
