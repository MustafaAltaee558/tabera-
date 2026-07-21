export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN environment variable is not set on Vercel' });
  }

  const owner = "MustafaAltaee558";
  const repo = "tabera-";
  const branch = "main";

  try {
    const { products, config } = req.body;

    const getFileSha = async (path) => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to get SHA for ${path}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.sha;
    };

    const updateFile = async (path, content, sha, message) => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content, 'utf-8').toString('base64'),
          sha,
          branch
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to update ${path}`);
      }
    };

    const productsSha = await getFileSha("public/products.json");
    const configSha = await getFileSha("public/config.json");

    const configContent = JSON.stringify(config || {}, null, 2);
    const productsContent = JSON.stringify(products || [], null, 2);

    await updateFile("public/products.json", productsContent, productsSha, "Update products database from Vercel API");
    await updateFile("public/config.json", configContent, configSha, "Update config from Vercel API");

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
