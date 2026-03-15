import { Helmet } from "react-helmet-async";

export default function SEOHead({ title, description, keywords, image, url }) {
  const siteName = "Petal & Paw";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Pet-Safe Flowers`;
  const defaultDesc = "Hand-crafted pet-safe floral arrangements for the modern, conscious home.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
