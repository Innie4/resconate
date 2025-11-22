export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json([
      { id: 1, text: 'Resconate moved us from idea to launch without breaking pace.', name: 'Adaeze N.', position: 'COO' },
      { id: 2, text: 'Payroll and compliance now feel automated; proactive team.', name: 'Derrick A.', position: 'People Lead' }
    ]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



