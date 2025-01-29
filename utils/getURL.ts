// 本番とローカルでURLを変更するための関数
export const getURL = () => {
  const url = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  return url
    ? `https://${url}`
    : `http://localhost:${process.env.PORT || 3000}`;
};
