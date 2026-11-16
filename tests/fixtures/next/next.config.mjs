import { withGiggyDev } from 'giggydev/next';
export default withGiggyDev({
  reactStrictMode: true,
  // The test suite runs dev and production servers concurrently.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
});
