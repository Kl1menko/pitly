/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/api/*", "/dashboard/*"],
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: "daily",
      priority: path.startsWith("/sto/") || path.startsWith("/shop/") ? 0.9 : 0.7,
      lastmod: new Date().toISOString()
    };
  }
};
