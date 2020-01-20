'use strict';

const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const dbConn = require('./lib/DynamoDbConnection');
const dbGateway = require('./lib/gateways/Dynamo')(dbConn);
const useCases = require('./lib/use-cases')({ dbGateway });

const app = express();

app.use(function(req, res, next) {
  // had to fix api gateway not removing content-encoding header after transforming content
  if(req.headers['content-encoding'] === 'gzip' && req.body.toString('utf8', 0, 1) === '{'){
    req.headers['content-encoding'] = 'identity';
  }
  next();
});
app.use(bodyParser.json());

app.get('/groups', async (req, res) => {
  try {
    const groups = await useCases.listGroups();
    res.send(groups);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post('/groups', async (req, res) => {
  try {
    console.log(req.json);
    const group = await useCases.createGroup(req.body);
    res.redirect(`/groups/${group.id}`);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get('/groups/:group_id', async (req, res) => {
  try {
    const group = await useCases.getGroup(req.params.group_id);
    if(group){
      res.send(group);
    }else{
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.put('/groups/:group_id', async (req, res) => {
  try {
    await useCases.updateGroup(req.params.group_id, req.body);
    res.sendStatus(204);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.put('/groups/:group_id/metrics', async (req, res) => {
  try {
    await useCases.createBulkReadings(Number(req.params.group_id), req.body);
    res.sendStatus(204);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get('/groups/:group_id/metrics/:metric_id', async (req, res) => {
  try {
    const values = await useCases.getValues(req.params.group_id, req.params.metric_id, req.query);
    res.send(values);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports.handler = serverless(app);
