module.exports = {
  count: async (collection) => {
    return global.redisClient.llenAsync(collection)
  },
  page: async (collection, offset) => {
    offset = offset || 0
    if (offset < 0) {
      throw new Error('invalid-offset')
    }
    const count = await global.redisClient.llenAsync(collection)
    if (count >= offset) {
      throw new Error('invalid-offset')
    }
    return global.redisClient.lrangeAsync(collection, offset, global.PAGE_SIZE + offset - 1)
  },
  add: async (collection, itemid) => {
    return global.redisClient.lpushAsync(collection, itemid)
  },
  remove: async (collection, itemid) => {
    return global.redisClient.lremAsync(collection, 1, itemid)
  }
}
