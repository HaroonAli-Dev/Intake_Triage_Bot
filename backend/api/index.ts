import serverless from 'serverless-http'
import app from '../src/index'

const handler = serverless(app)

export default handler
module.exports = handler
