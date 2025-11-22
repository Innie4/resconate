const { getEmployeeMe } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getEmployeeMe(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



