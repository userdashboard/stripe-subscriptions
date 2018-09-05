module.exports = {
  before: (req) => {
    req.appid = process.env.APPID || 'app'
  }
}
