const client = {
  aput: jest.fn(),
  aget: jest.fn(),
  aupdate: jest.fn(),
  ascan: jest.fn(),
  aquery: jest.fn()
}

const tables = {
  valuesTable: 'VALUES_TABLE',
  groupsTable: 'GROUPS_TABLE'
}

module.exports = { client, tables };