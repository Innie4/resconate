export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json([
      { id: 1, name: 'Zocket AI', description: 'AI-powered marketing platform', image: 'https://placehold.co/600x400/111/333', category: 'Web App', color: 'blue', technologies: ['React','Node.js','TensorFlow'] },
      { id: 2, name: 'HeavyOps', description: 'Fleet management solution', image: 'https://placehold.co/600x400/111/333', category: 'Mobile App', color: 'orange', technologies: ['React Native','Firebase','Google Maps API'] }
    ]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



