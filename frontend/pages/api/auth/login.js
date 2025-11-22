const { loginAdmin } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return loginAdmin(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



